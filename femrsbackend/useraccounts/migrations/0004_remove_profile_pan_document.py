# Generated by Django 5.1.5 on 2025-02-17 10:26

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('useraccounts', '0003_alter_profile_aadhaar_number_and_more'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='profile',
            name='pan_document',
        ),
    ]
