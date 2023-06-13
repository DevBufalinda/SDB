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


def getManifestList(request):
    # Realizar la consulta SQL a la Base de datos
    with connections["Despacho_db"].cursor() as cursor:
        cursor.execute("""
                        SELECT FrtTerms.FrtTermsID AS Num_Manifiesto, 
                               FrtTerms.Descr AS Descripcion, 
                               CONVERT(DATE, FrtTerms.User9, 103) AS Fecha, 
                               FrtTerms.FOBID AS Camion,
                               COUNT(SOHeader.FrtTermsID) AS Count_Ord
                        FROM FrtTerms
                        INNER JOIN SOHeader ON SOHeader.FrtTermsID = FrtTerms.FrtTermsID
                        WHERE FrtTerms.User9 >= DATEADD(month, -5, GETDATE())
                        GROUP BY FrtTerms.FrtTermsID, 
                                 Descr, 
                                 FrtTerms.User9,
                                 FrtTerms.FOBID
                        HAVING COUNT(SOHeader.FrtTermsID) > 0
                        ORDER BY FrtTerms.User9 DESC
                        """)
        rows = cursor.fetchall()
    # Devolver los resultados de la consulta como una respuesta JSON
    data = []
    for row in rows:
        data.append({
            'FrtTermsID': row[0],
            'Descr': row[1],
            'User9': row[2],
            'User7': row[3],
            'FOBID': row[4],
        })

    return JsonResponse({'data': data})

def getSerialsList(request):
    frt_terms_id = request.GET.get('frt_terms_id')
    # Realizar la consulta SQL a la Base de datos
    with connections["Despacho_db"].cursor() as cursor:
        cursor.execute("""
                        SELECT l.InvtID, 
                               l.Descr, 
                               SUM(l.User5) AS pedido, 
                               ROUND(SUM(l.QtyOrd), 2) AS QtyOrd, 
                               ROUND(SUM(l.QtyShip), 2) AS QtyShip, 
                               SUM(t.cuantos) AS cuantos, 
                               ROUND(SUM(p.cargado), 2) AS ser_cargados
                        FROM SOLine l
                        INNER JOIN SOHeader h ON h.OrdNbr = l.OrdNbr
                        INNER JOIN (SELECT RefNbR, 
                                           InvtID,
                                           COUNT(INVTID) AS cuantos 
                                    FROM xserialesTran
                                    GROUP BY RefNbr, InvtID) t ON t.RefNbr = h.OrdNbr AND l.InvtID = t.InvtID
                        INNER JOIN (SELECT r.RefNbr, 
                                           r.InvtID,
                                           SUM(s.PESO) AS cargado
                                    FROM xSerialesTran r
                                    INNER JOIN xSerialesTemp s ON s.LotSerNbr = r.LotSerNbr
                                    GROUP BY r.RefNbr,r.InvtID) AS p ON p.InvtID = l.InvtID AND h.OrdNbr = p.RefNbr
                        WHERE h.FrtTermsID = %s
                        GROUP BY l.InvtID, l.Descr
                        ORDER BY l.InvtID
                        """, [frt_terms_id])
        rows = cursor.fetchall()
    # Devolver los resultados de la consulta como una respuesta JSON
    data = []
    for row in rows:
        data.append({
            'InvtID': row[0],
            'Descr': row[1],
            'User5': row[2],
            'QtyOrd': row[3],
            'QtyShip': row[4],
            'cuantos': row[5],
            'cargado': row[6],
        })

    return JsonResponse({'data': data})


def getOrdList(request):
    frt_terms_id = request.GET.get('frt_terms_id')
    Invt_ID = request.GET.get('Invt_ID')

    # Realizar la consulta SQL a la Base de datos
    with connections["Despacho_db"].cursor() as cursor:
        cursor.execute("""
                               SELECT l.OrdNbr AS Orden, 
                               SUM(l.User5) AS pedido,
                               SUM(l.QtyOrd) AS QtyOrd,
                               SUM(l.QtyShip) AS QtyShip, 
                               SUM(t.cuantos) AS cuantos,
                               ROUND(SUM(p.cargado), 2) AS cargados, 
                               h.CustID AS IDCliente,  
                               h.BillName AS Cliente, 
                               h.ShiptoID AS IDSucursal, 
                               h.ShipName AS Sucursal
                        FROM SOLine l
                        INNER JOIN SOHeader h ON h.OrdNbr = l.OrdNbr
                        INNER JOIN (SELECT RefNbR, 
                                           InvtID,
                                           COUNT(INVTID) AS cuantos 
                                    FROM xserialesTran GROUP BY RefNbr, InvtID) t ON t.RefNbr = h.OrdNbr AND l.InvtID = t.InvtID
                        INNER JOIN (SELECT r.RefNbr, 
                                           r.InvtID,
                                           SUM(s.PESO) AS cargado 
                                    FROM xSerialesTran r
                                    INNER JOIN xSerialesTemp s ON s.LotSerNbr = r.LotSerNbr
                                    GROUP BY r.RefNbr, r.InvtID) AS p ON p.InvtID = l.InvtID AND h.OrdNbr=p.RefNbr
                        WHERE h.FrtTermsID = '6052202' AND l.InvtID = %s
                        GROUP BY h.BillName,
                                 l.OrdNbr,
                                 h.ShipCustID,
                                 h.CustID,
                                 h.BillName,
                                 h.ShiptoID,
                                 h.ShipName
                        ORDER BY h.CustID
                        """, [Invt_ID])
        rows = cursor.fetchall()
    # Devolver los resultados de la consulta como una respuesta JSON
    data = []
    for row in rows:
        data.append({
            'OrdNbr': row[0],
            'User5': row[1],
            'QtyOrd': row[2],
            'QtyShip': row[3],
            'cuantos': row[4],
            'cargado': row[5],
            'CustID': row[6],
            'BillName': row[7],
            'ShiptoID': row[8],
            'ShipName': row[9],
        })

    return JsonResponse({'data': data})

