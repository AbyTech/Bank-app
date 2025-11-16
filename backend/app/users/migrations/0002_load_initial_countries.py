from django.db import migrations

def load_initial_countries(apps, schema_editor):
    CountryCurrency = apps.get_model('users', 'CountryCurrency')
    countries = [
        {'country_name': 'United States', 'country_code': 'US', 'currency_code': 'USD', 'currency_symbol': '$', 'is_active': True},
        {'country_name': 'United Kingdom', 'country_code': 'GB', 'currency_code': 'GBP', 'currency_symbol': '£', 'is_active': True},
        {'country_name': 'Nigeria', 'country_code': 'NG', 'currency_code': 'NGN', 'currency_symbol': '₦', 'is_active': True},
        {'country_name': 'Ghana', 'country_code': 'GH', 'currency_code': 'GHS', 'currency_symbol': 'GH₵', 'is_active': True},
        {'country_name': 'Kenya', 'country_code': 'KE', 'currency_code': 'KES', 'currency_symbol': 'KSh', 'is_active': True},
        {'country_name': 'South Africa', 'country_code': 'ZA', 'currency_code': 'ZAR', 'currency_symbol': 'R', 'is_active': True},
        {'country_name': 'European Union', 'country_code': 'EU', 'currency_code': 'EUR', 'currency_symbol': '€', 'is_active': True},
    ]
    for country in countries:
        CountryCurrency.objects.create(**country)

class Migration(migrations.Migration):

    dependencies = [
        ('users', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(load_initial_countries),
    ]