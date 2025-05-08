from django.db import models
from django.contrib.auth.models import User
from django.core.validators import RegexValidator

# PAN & Aadhaar Validators
pan_validator = RegexValidator(
    regex=r'^[A-Z]{5}[0-9]{4}[A-Z]{1}$',
    message="Enter a valid PAN number (e.g., ABCDE1234F)."
)

aadhaar_validator = RegexValidator(
    regex=r'^\d{12}$',
    message="Aadhaar number must be exactly 12 digits."
)

# User Type Choices
FARMER = 'farmer'
OWNER = 'owner'
USER_TYPE_CHOICES = [
    (FARMER, 'Farmer'),
    (OWNER, 'Owner'),
]

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    phone_number = models.CharField(max_length=15, blank=True)
    user_type = models.CharField(max_length=10, choices=USER_TYPE_CHOICES)

    pan_number = models.CharField(
        max_length=10, 
        unique=True, 
        blank=True, 
        default="",  # Ensure default non-null value
        validators=[pan_validator]
    )  
    aadhaar_number = models.CharField(
        max_length=12, 
        unique=True, 
        blank=True,
        default="",  # Ensure default non-null value
        validators=[aadhaar_validator]
    )  

    aadhaar_document = models.FileField(upload_to='documents/aadhaar/', blank=True, null=True)

    def __str__(self):
        return f"{self.user.username} - {self.user_type}"
    
    def delete(self, *args, **kwargs):
        # Delete associated user when profile is deleted
        self.user.delete()
        super().delete(*args, **kwargs)