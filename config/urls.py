from django.contrib import admin
from django.urls import include, path
from cartographie import views

urlpatterns = [
    path("", views.accueil, name="accueil"),
    path("admin/", admin.site.urls),
    path("carte/", include("cartographie.urls")),
    path("comptes/", include("comptes.urls")),
    path("referentiels/", include("referentiels.urls")),
    path("donnees/", include("donnees.urls")),
    path("analyses/", include("analyses.urls")),
    path("prediction/", include("prediction.urls")),
]
