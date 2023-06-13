from django.urls import path, re_path
from apps.home import views

urlpatterns = [

    # Vista hacia la pagina home
    path('', views.index, name = 'home'),

    # Vista con respecto a todos los productos asociados a cada manifiesto
    path('seriales/', views.getSerialsList, name ='getSerialsList'),

    #Vista con respecto a los manifiestos de los ultimos 15 dias
    path('manifiesto/', views.getManifestList, name ='getManifestList'),

    #Vista con respecto a las lista ordenes asociadas a cada producto
    path('ordenes/', views.getOrdList, name ='getOrdList'),

    # Matches any html file
    re_path(r'^.*\.*', views.pages, name = 'pages'),

]
