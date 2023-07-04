# [Sistema de Gestión y Control | Despacho](https://www.bufalinda.com/)

 👉 Sistema para la Gestión y Control en el Area de Despacho. 

<br />

> Herramientas Utilizadas 

- ✅ Django Versión 3.2.16
- ✅ Python Versión 3.11.3
- ✅ pip Versión 23.1.2 
- ✅ Servidor IIS
- ✅ SQL Server
- ✅ Bootstrap Versión 4.0.0
- ✅ HTML / CSS
- ✅ JavaScript
- ✅ Libreria jQuery JavaScript v3.5.1
- ✅ Datatables API Versión 1.13.4
- ✅ Plantilla Base [Django Atlantis](https://appseed.us/product/atlantis-dark/django/)


![SGCD](https://raw.githubusercontent.com/DevBufalinda/SDB/master/static/assets/img/fondo-readme.png)

<br />

## Instalación del Sistema de Despacho

> 👉 **Paso 1** - Descarga el código del repositorio de GH (usando `GIT BASH`) 

```bash
git clone https://github.com/DevBufalinda/SDB
```

<br />

> 👉 **Paso 2** - Ruta del repositorio

```bash 
C:\inetpub\wwwroot
```

Tal que se visualice de la siguiente manera: `C:\inetpub\wwwroot\SDB`

<br />

> 👉 **Paso 3** - Intalación de Python Versión 3.11.3

Al instalar Python modificar la ruta e instalarno en la ruta: `C:\`

<br />

> 👉 **Paso 4** - Intalación de los requerimientos

Abrir el GIT BASH desde la ruta `C:\inetpub\wwwroot\SDB`

```bash 
pip install -r requirements.txt
```
<br />

## Configuración del Servidor IIS y Activación del CGI

> 👉 **Paso 1** - Instalación del modulo CGI

- ✅ Abrir el Server Manager del Servidor
- ✅ Dashboard e ir a la parte de `add roles and features`
- ✅ Siguiente hasta llegar a la sección de `Server Roles`
- ✅ Buscar la opción Web Server (IIS) y clickear `add features`
- ✅ Siguiente hasta llegar a la parte de `Web Server Role (IIS) >> Role Services`
- ✅ Buscar Application Development y activar el checkbox CGI
- ✅ Siguiente e Instalar

<br />

> 👉 **Paso 2** - Activación u Configuración del modulo CGI

- ✅ Abrir CMD en la ruta `C:\`

```bash 
wfastcgi-enable
```

- ✅ Al ejecutar la linea de comando saldra que se han aplicado los cambios de configuracion para la sección `"system.webServer/fastCgi"` y se mostrara una ruta del siguiente estilo `"C:\Python311\python.exe|C:\Python311\Lib\site-packages\wfastcgi.py"`

- ✅ Al habilitar wfastcgi la copiar la ruta de configuración se muestra en el CMD, luego, ir al archivo de configuracion `web.config` que se encuentra en la ruta `C:\inetpub\wwwroot\`. Dentro del archivo verificar el controlador `scriptProcessor` y pegar la ruta de configuracion del CGI.

- ✅ De tal manera que la linea de configuracion quedará: `scriptProcessor="C:\Python311\python.exe|C:\Python311\Lib\site-packages\wfastcgi.py"`

<br />

> 👉 **Paso 3** - Configuración del IIS

- ✅ Abrir Servidor IIS
- ✅ Ir a la seccion de Administración >> Editor de configuración
- ✅ Desplegar la Sección y seleccionar: `system.webServer/handlers`
- ✅ En la misma vista del Editor de Configuración, en la barra lateral derecha, dar click en `Desbloquer Sección`
- ✅ Dirigirse a los sitios web y buscar la carpeta `SDB`
  - ✅ Dar click derecho, `Agregar directorio virtual...`.
  - ✅ Alias: `static`
  - ✅ Ruta de acceso física: `C:\inetpub\wwwroot\SDB\apps\static`
- ✅ Abrir el navegador y ejecutar localhost

<br />