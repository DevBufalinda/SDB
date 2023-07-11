# -*- encoding: utf-8 -*-
"""
Copyright (c) 2019 - present AppSeed.us
"""

from django.contrib import admin
from django.urls import path, include  # add this

urlpatterns = [
    path('SDB/admin/', admin.site.urls),          # Django admin route
    path("SDB/", include("apps.authentication.urls")), # Auth routes - login / register

    # ADD NEW Routes HERE

    # Leave `Home.Urls` as last the last line
    path("SDB/", include("apps.home.urls"))
]
