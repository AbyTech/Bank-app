import uuid
import bcrypt
import random
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.utils import timezone
from mnemonic import Mnemonic


# -----------------------------
# Custom User Manager
# -----------------------------
class UserManager(BaseUserManager):
    def create_user(self, email, name, country, currency_code, password=None, **extra_fields):
        if not email:
            raise ValueError("The Email field must be set")
        email = self.normalize_email(email)
        extra_fields.pop('username', None)
        user = self.model(
            email=email,
            name=name,
            country=country,
            currency_code=currency_code,
            **extra_fields
        )
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("role", "admin")

        if not password:
            raise ValueError("Superuser must have a password.")
        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")

        # Set default values for required fields if not provided
        extra_fields.setdefault("name", "Admin User")
        extra_fields.setdefault("country", "US")
        extra_fields.setdefault("currency_code", "USD")

        # Extract required fields from extra_fields to pass as positional args
        name = extra_fields.pop("name")
        country = extra_fields.pop("country")
        currency_code = extra_fields.pop("currency_code")

        return self.create_user(email, name, country, currency_code, password=password, **extra_fields)


# -----------------------------
# Custom User Model
# -----------------------------
class User(AbstractBaseUser, PermissionsMixin):
    ROLE_CHOICES = [
        ("customer", "Customer"),
        ("admin", "Admin"),
        ("support", "Support Staff"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=150, blank=True)
    last_name = models.CharField(max_length=150, blank=True)
    name = models.CharField(max_length=255) # Keep this for full name display
    country = models.CharField(max_length=2)  # ISO 3166-1 alpha-2
    currency_code = models.CharField(max_length=3, default="USD")  # ISO 4217
    balance = models.DecimalField(max_digits=15, decimal_places=2, default=0.00)
    seed_phrase_hash = models.CharField(max_length=255)
    two_fa_enabled = models.BooleanField(default=False)
    two_fa_secret = models.CharField(max_length=32, blank=True, null=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default="customer")
    profile_photo = models.ImageField(upload_to="profiles/", null=True, blank=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(default=timezone.now)

    objects = UserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["name", "country", "currency_code"] # Add country and currency_code as required

    def __str__(self):
        return self.email

    # -----------------------------
    # Seed phrase handling
    # -----------------------------
    def set_seed_phrase(self, seed_phrase):
        """Hash and store the seed phrase."""
        self.seed_phrase_hash = bcrypt.hashpw(
            seed_phrase.encode("utf-8")[:72], bcrypt.gensalt()
        ).decode("utf-8")

    def check_seed_phrase(self, seed_phrase):
        """Verify the seed phrase."""
        return bcrypt.checkpw(
            seed_phrase.encode("utf-8")[:72], self.seed_phrase_hash.encode("utf-8")
        )

    def generate_seed_phrase(self):
        """Generate a 12-word random seed phrase."""
        words = [
            "abandon", "ability", "able", "about", "above", "absent", "absorb",
            "abstract", "absurd", "abuse", "access", "accident", "account",
            "accuse", "achieve", "acid"
        ]
        return " ".join(random.choice(words) for _ in range(12))


# -----------------------------
# 2FA Model
# -----------------------------
class TwoFACode(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    is_used = models.BooleanField(default=False)

    def is_valid(self):
        return not self.is_used and timezone.now() < self.expires_at


# -----------------------------
# Activity Feed Model
# -----------------------------
class ActivityFeed(models.Model):
    ACTION_TYPES = [
        ("login", "User Login"),
        ("transaction", "Transaction"),
        ("card_purchase", "Card Purchase"),
        ("loan_application", "Loan Application"),
        ("profile_update", "Profile Update"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    action_type = models.CharField(max_length=20, choices=ACTION_TYPES)
    details = models.JSONField(default=dict)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-timestamp"]


# -----------------------------
# CountryCurrency Model
# -----------------------------
class CountryCurrency(models.Model):
    country_name = models.CharField(max_length=100)
    country_code = models.CharField(max_length=2, unique=True)
    currency_code = models.CharField(max_length=3)
    currency_symbol = models.CharField(max_length=5)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.country_name} ({self.currency_code})"
