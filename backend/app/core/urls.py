from django.contrib import admin
from django.urls import path, include, re_path
from django.views.generic.base import RedirectView
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from rest_framework import permissions
from django.views.static import serve
from django.conf import settings

# Swagger/OpenAPI setup
schema_view = get_schema_view(
    openapi.Info(
        title="Primewave Bank API",
        default_version='v1',
        description="API for Primewave Bank",
    ),
    public=True,
    permission_classes=[permissions.AllowAny],
)

urlpatterns = [
    # Redirect root URL to Swagger docs
    path('', RedirectView.as_view(url='/api/docs/', permanent=False)),

    # Admin
    path('admin/', admin.site.urls),

    # API endpoints
    path('api/auth/', include('app.users.urls')),
    path('api/bank/', include('app.bank.urls')),
    path('api/cards/', include('app.cards.urls')),
    path('api/loans/', include('app.loans.urls')),
    path('api/support/', include('app.support.urls')),
    path('api/payments/', include('app.payments.urls')),
    path('api/analytics/', include('app.analytics.urls')),

    # Swagger docs
    path('api/docs/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
]

# Serve static and media files in production (Render)
if not settings.DEBUG:
    urlpatterns += [
        re_path(r'^static/(?P<path>.*)$', serve, {'document_root': settings.STATIC_ROOT}),
        re_path(r'^media/(?P<path>.*)$', serve, {'document_root': settings.MEDIA_ROOT}),
    ]
