from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import make_password
from .models import CountryCurrency

User = get_user_model()

class UserRegistrationSerializer(serializers.ModelSerializer):
    name = serializers.CharField(write_only=True)
    seed_phrase = serializers.CharField(write_only=True)
    country = serializers.SlugRelatedField(
        slug_field='country_code',
        queryset=CountryCurrency.objects.all(),
        write_only=True
    )

    class Meta:
        model = User
        fields = ('email', 'name', 'country', 'seed_phrase')

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with that email already exists.")
        return value

    def create(self, validated_data):
        user = User.objects.create_user(
            email=validated_data['email'],
            name=validated_data['name'], # Pass the full name to the 'name' field
            country=validated_data['country'].country_code, # Extract the country_code from the CountryCurrency object
            currency_code=validated_data['country'].currency_code # Set the currency code
        )
        user.set_seed_phrase(validated_data['seed_phrase'])
        user.save()
        return user

class UserLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    seed_phrase = serializers.CharField()

class TwoFASerializer(serializers.Serializer):
    code = serializers.CharField(max_length=6)

class UserProfileSerializer(serializers.ModelSerializer):
    first_name = serializers.SerializerMethodField()
    profile_photo = serializers.ImageField(required=False)

    class Meta:
        model = User
        fields = ('id', 'email', 'name', 'first_name', 'country', 'currency_code', 'balance', 'two_fa_enabled', 'date_joined', 'profile_photo')

    def get_first_name(self, obj):
        return obj.name.split()[0] if obj.name else ''

class CountryCurrencySerializer(serializers.ModelSerializer):
    code = serializers.CharField(source='country_code') # Map 'country_code' to 'code'
    name = serializers.CharField(source='country_name') # Map 'country_name' to 'name'
    currency = serializers.CharField(source='currency_code') # Map 'currency_code' to 'currency'

    class Meta:
        model = CountryCurrency
        fields = ('code', 'name', 'currency', 'exchange_rate')
