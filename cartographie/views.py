from django.shortcuts import render


def index(request):
    return render(request, "cartographie/index.html")


def accueil(request):
    return render(request, "cartographie/accueil.html")
