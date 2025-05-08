from django.db import models

# Create your models here.
from django.db import models
from django.conf import settings
from equipmentlisting.models import Equipment

class Review(models.Model):
    RATING_CHOICES = [
        (0.5, '0.5 - Very Poor'),
        (1, '1 - Poor'),
        (1.5, '1.5 - Below Average'),
        (2, '2 - Fair'),
        (2.5, '2.5 - Slightly Fair'),
        (3, '3 - Good'),
        (3.5, '3.5 - Above Average'),
        (4, '4 - Very Good'),
        (4.5, '4.5 - Excellent'),
        (5, '5 - Outstanding'),
    ]

    equipment = models.ForeignKey(Equipment, on_delete=models.CASCADE, related_name='reviews')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    rating = models.DecimalField(max_digits=2, decimal_places=1, choices=RATING_CHOICES)
    comment = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('equipment', 'user')  # Ensure one review per user per equipment
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.equipment.equipment_name} - {self.user.username} ({self.rating})"

    @staticmethod
    def calculate_average_rating(equipment):
        average = equipment.reviews.aggregate(models.Avg('rating'))['rating__avg']
        return round(average, 1) if average else 0.0

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        self.equipment.average_rating = self.calculate_average_rating(self.equipment)
        self.equipment.save(update_fields=['average_rating'])
