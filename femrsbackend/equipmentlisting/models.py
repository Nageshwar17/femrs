from django.db import models

# Create your models here.

from django.contrib.auth.models import User

class Equipment(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="equipments")
    equipment_name = models.CharField(max_length=30)
    description = models.TextField()
    average_rating = models.FloatField(default=0.0)  # Store average rating

    # Location details
    address = models.CharField(max_length=255)
    pin_code = models.CharField(max_length=6)
    state = models.CharField(max_length=50)
    district = models.CharField(max_length=50)
    sub_district = models.CharField(max_length=50)

    # Pricing and status
    price_per_day = models.DecimalField(max_digits=10, decimal_places=2)
    available = models.BooleanField(default=True)

    # Images
    image1 = models.ImageField(upload_to='equipment_images/')
    image2 = models.ImageField(upload_to='equipment_images/', blank=True, null=True)

    # Date the equipment was added
    date_added = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.equipment_name
