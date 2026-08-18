import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react'
import { connectWallet as runConnector } from '../services/walletConnectors'
import { walletAPI } from '../services/walletApi'
import { recordRecentWallet } from '../services/walletList'

/**
 * WalletProvider - app-wide "connected wallet" state backed by the server.
 * ---------------------------------------------------------------------------
 * Connections are created in demo/simulation mode: when a user picks a wallet,
 * enters a name and clicks Connect, the backend instantly records a connected
 * wallet (with a server-generated PUBLIC demo address) and this context tracks
 * it app-wide. Only the user-entered name + public metadata (provider, address,
 * network) are stored. Nothing secret is ever requested, sent or stored.
 */
const WalletContext = createContext(null)

export const WalletProvider = ({ children }) => {
  const [connection, setConnection] = useState(null)
  const [connections, setConnections] = useState([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const current = await walletAPI.getCurrent()
      setConnection(current)
      const all = await walletAPI.getConnections()
      setConnections(all || [])
    } catch (error) {
      setConnection(null)
      setConnections([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  /**
   * Connect a wallet to a network. Runs the real connector, then persists the
   * public metadata + user-entered name on the backend and updates local state.
   * @param {{id:string,name:string,connectors:string[]}} wallet
   * @param {{id:string,family:string,chainId?:string}} network
   * @param {string} ownerName - name the user typed for this wallet
   * @returns {Promise<object>} the saved backend connection
   */
  const connect = useCallback(
    async (wallet, network, ownerName = '') => {
      const result = await runConnector(wallet, network)
      const saved = await walletAPI.connect({
        walletProviderId: wallet.id,
        walletProviderName: wallet.name,
        walletAddress: result.address,
        network: result.network,
        chainId: result.chainId || undefined,
        walletOwnerName: String(ownerName || '').trim(),
      })
      recordRecentWallet(wallet.id)
      setConnection(saved)
      setConnections((prev) => [saved, ...prev.filter((c) => (c._id || c.id) !== (saved._id || saved.id))].slice(0, 10))
      return saved
    },
    []
  )

  /**
   * Simulate a wallet connection (demo mode). No real wallet is involved - the
   * backend instantly creates a connected record with a server-generated PUBLIC
   * demo address and stores the user-entered name. No seed phrases or private
   * keys are ever requested, sent or stored.
   * @param {{id:string,name:string,connectors:string[]}} wallet
   * @param {{id:string,family:string,chainId?:string}} network
   * @param {string} ownerName - name the user typed for this wallet
   * @returns {Promise<object>} the saved backend connection
   */
  const simulateConnect = useCallback(
    async (wallet, network, ownerName = '') => {
      const response = await walletAPI.simulate({
        walletProviderId: wallet.id,
        walletProviderName: wallet.name,
        network: network.id,
        walletOwnerName: String(ownerName || '').trim(),
      })
      const saved = response.data
      recordRecentWallet(wallet.id)
      setConnection(saved)
      setConnections((prev) => [saved, ...prev.filter((c) => (c._id || c.id) !== (saved._id || saved.id))].slice(0, 10))
      return saved
    },
    []
  )

  const disconnectCurrent = useCallback(async () => {
    const current = connection || connections.find((c) => c.connectionStatus === 'connected')
    if (current) {
      try {
        await walletAPI.disconnect(current._id || current.id)
      } catch (error) {
        // Continue clearing local state even if the server call fails.
      }
      setConnections((prev) =>
        prev.map((c) => ((c._id || c.id) === (current._id || current.id) ? { ...c, connectionStatus: 'disconnected' } : c))
      )
    }
    setConnection(null)
  }, [connection, connections])

  const setConnected = useCallback((conn) => {
    setConnection(conn)
    setConnections((prev) =>
      conn ? [conn, ...prev.filter((c) => (c._id || c.id) !== (conn._id || conn.id))] : prev
    )
  }, [])

  const value = useMemo(
    () => ({
      connection,
      connections,
      loading,
      refresh,
      connect,
      simulateConnect,
      disconnect: disconnectCurrent,
      setConnected,
    }),
    [connection, connections, loading, refresh, connect, simulateConnect, disconnectCurrent, setConnected]
  )

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
}

export const useWallet = () => {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider')
  }
  return context
}