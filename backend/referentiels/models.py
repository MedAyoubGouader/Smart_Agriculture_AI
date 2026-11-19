from django.core.exceptions import ValidationError
from django.db import models


class Gouvernorat(models.Model):
    code = models.CharField(max_length=10, unique=True)
    nom = models.CharField(max_length=100)
    geometrie = models.JSONField(blank=True, null=True)

    class Meta:
        ordering = ['nom']

    def __str__(self):
        return self.nom


class Culture(models.Model):
    nom = models.CharField(max_length=100, unique=True)

    class Meta:
        ordering = ['nom']

    def __str__(self):
        return self.nom


class SaisonAgricole(models.Model):
    libelle = models.CharField(max_length=50, unique=True)
    date_debut = models.DateField()
    date_fin = models.DateField()

    class Meta:
        ordering = ['-date_debut']
        constraints = [models.CheckConstraint(
            condition=models.Q(date_fin__gte=models.F('date_debut')),
            name='saison_fin_apres_debut',
        )]

    def clean(self):
        super().clean()
        if self.date_debut and self.date_fin and self.date_fin < self.date_debut:
            raise ValidationError({'date_fin': 'La fin doit suivre le début de la saison.'})

    def __str__(self):
        return self.libelle
