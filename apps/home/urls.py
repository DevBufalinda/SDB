from django.urls import path, re_path
from apps.home import views

urlpatterns = [

    # Vista hacia la pagina home
    path('', views.index, name = 'home'),

    # Vista con respecto a todos los productos asociados a cada manifiesto
    path('SERIALS/', views.getProductList, name ='getProductList'),

    #Vista con respecto a los manifiestos de los ultimos 15 dias
    path('MANIFEST/', views.getManifestList, name ='getManifestList'),

    #Vista con respecto a las lista ordenes asociadas a cada producto
    path('ORDERS/', views.getOrdList, name ='getOrdList'),

    #Vista con respecto a la captura de los seriales
    path('ADDSERIALS/', views.addSerialsDetail, name = 'addSerialsDetail'),

    #Vista con respecto a la captura de los seriales
    path('PREFIXLOTSER/', views.prefixSerialsVa, name = 'prefixSerialsVa'),

    # Matches any html file
    re_path(r'^.*\.*', views.pages, name = 'pages'),

]
