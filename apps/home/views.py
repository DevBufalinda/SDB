# -*- encoding: utf-8 -*-
"""
Copyright (c) 2019 - present AppSeed.us
"""

from django import template
from django.contrib.auth.decorators import login_required
from django.http import HttpResponse, HttpResponseRedirect
from django.template import loader
from django.urls import reverse
from django.db import connections
from django.http.response import JsonResponse


@login_required(login_url="/login/")
def index(request):
    context = {'segment': 'index'}

    html_template = loader.get_template('home/index.html')
    return HttpResponse(html_template.render(context, request))


@login_required(login_url="/login/")
def pages(request):
    context = {}
    # All resource paths end in .html.
    # Pick out the html file name from the url. And load that template.
    try:

        load_template = request.path.split('/')[-1]

        if load_template == 'admin':
            return HttpResponseRedirect(reverse('admin:index'))
        context['segment'] = load_template

        html_template = loader.get_template('home/' + load_template)
        return HttpResponse(html_template.render(context, request))

    except template.TemplateDoesNotExist:

        html_template = loader.get_template('home/page-404.html')
        return HttpResponse(html_template.render(context, request))

    except:
        html_template = loader.get_template('home/page-500.html')
        return HttpResponse(html_template.render(context, request))


def get_serials_list(request):
    frt_terms_id = request.GET.get('frt_terms_id')
    
    # Realizar la consulta SQL a la Base de datos
    with connections["Despacho_db"].cursor() as cursor:
        cursor.execute("""SELECT InvtID, 
                          Descr, 
                          SUM(QtyOrd), 
                          SUM(QtyShip) FROM SOLine
                          INNER JOIN SOHeader ON SOHeader.OrdNbr = SOLine.OrdNbr
                          WHERE SOHeader.FrtTermsID = %s
                          GROUP BY InvtID, Descr
                          ORDER BY InvtID""", [frt_terms_id])
        rows = cursor.fetchall()
    # Devolver los resultados de la consulta como una respuesta JSON
    data = []
    for row in rows:
        data.append({
            'InvtID': row[0],
            'Descr': row[1],
            'QtyOrd': row[2],
            'QtyShip': row[3]
        })

    return JsonResponse({'data': data})


