/* Tribute to old iPhones */
if( window.NodeList && !NodeList.prototype.forEach ) 
{
    NodeList.prototype.forEach = Array.prototype.forEach;
}      

function beReady( fn ) 
{
    // see if DOM is already available
    if( document.readyState === "complete" || document.readyState === "interactive" ) 
    {
        // call on next available tick
        setTimeout( fn, 1 );
    } 
    else 
    {
        document.addEventListener( "DOMContentLoaded", fn );
    }
} 

function be$( term, base_or_fn ) 
{
    if( typeof( base_or_fn ) == "function" )
    {
        var all = document.querySelectorAll( term ); 
        all.forEach( base_or_fn );
        return all;
    } 

    return ( base_or_fn || document ).querySelectorAll( term );
} 

function beGoBack()
{
    if( !window.beHistory || window.beHistory.length < 1 )
    {
        return;
    }

    var isOpExecuted = document.querySelector( "#mainContent #operationBackLink" ) != null;
    var isQueryShown = document.querySelector( "#mainContent #queryBackLink" ) != null;

    var last = window.beHistory[ window.beHistory.length - 1 ];

    if( isQueryShown )
    {
        window.beHistory.pop(); // remove ouselves
        last = window.beHistory.pop();  
        beShowPage( last.content );
        beSaveHistory( last );   
    }
    else if( isOpExecuted )
    {
        last = window.beHistory.pop();  
        loadPageWithProgress( last.menuLink, last.params );
    }
    else // Cancel button in Form
    {   
        last = window.beHistory.pop();  
        beShowPage( last.content );
        beSaveHistory( last );   
    }

    return false;
}

function beSaveHistory( visit )
{
    var prev = window.beHistory.length > 0  ? window.beHistory[ window.beHistory.length - 1 ] : null;
    var bSave = !prev;
    if( !bSave && ( prev.aEl != visit.aEl || !paramsAreEqual( visit.params, prev.params ) ) )
    {
        bSave = true;
    }
    if( bSave && !visit.params.form )
    { 
        window.beHistory.push( visit );
    }
}

function beFixLinks4Bootstrap( div )
{
    var links = div.querySelectorAll( "a" );
    links.forEach( function( link )
    {  
        if( link.onclick )
        {
            //console.log( "Skipped '" + link.href + "' because of " + link.onclick  );
            return; 
        }

        link.onclick = function()
        {
            loadPageWithProgress( null, 
            { 
              url: this.href, 
              title: this.innerText, 
              type: 'text'
            }, /*bRefreshPage*/ this.id == "refreshLink" ); 

            return false;
        };
    });
}

function beShowPage( html )
{
    var mainContent = document.querySelector( "#mainContent" );

    mainContent.innerHTML = ""; 

    console.log( "window.getEventListeners = " + window.getEventListeners );
    console.log( window );

    var nLoadListenersBefore = window.getEventListeners ?
             window.getEventListeners( window )[ "load" ].length : 0;
    console.log( "nLoadListenersBefore = " + nLoadListenersBefore );

    var onloadBefore = window.onload; 
        
    var container = document.createElement( "div" );
    container.innerHTML = html;
    // cache a reference to all the scripts in the container
    var scripts = container.querySelectorAll( "script" );
    // get all child elements and clone them in the target element
    var nodes = container.childNodes;
    for( var i = 0; i < nodes.length; i++ )
    {
        var node = nodes[ i ].cloneNode( true );
        if( node.querySelectorAll && node.nodeName != "SCRIPT" && node.nodeName != "#text" )
        {
            //console.log( 'node.nodeName = ' + node.nodeName );
            var links = node.querySelectorAll( "a" );
            links.forEach( function( link )
            {  
                if( link.onclick )
                {
                    //console.log( "Skipped '" + link.href + "' because of " + link.onclick  );
                    return; 
                }

                link.onclick = function()
                {
                    loadPageWithProgress( null, 
                    { 
                      url: this.href, 
                      title: this.innerText, 
                      type: 'text'
                    }, /*bRefreshPage*/ this.id == "refreshLink" ); 

                    return false;
                };

                //console.log( "Captured '" + link.href + "'" );
            });
        }

        mainContent.appendChild( node );
    }

    // force the found scripts to execute...
    for( var i = 0; i < scripts.length; i++)
    {
        var script = document.createElement( "script" );
        script.type = scripts[ i ].type || "text/javascript";
        if( scripts[ i ].hasAttribute( "src" ) )
        {
            script.src = scripts[ i ].src;
        } 
        script.innerHTML = scripts[ i ].innerHTML;
        document.head.appendChild(script);
        document.head.removeChild(script);
    }

    var documentTitle = container.querySelector( "#documentTitle" );
    var documentMobileTitle = container.querySelector( "#documentMobileTitle" );
    if( documentTitle )
    {  
        document.title = documentTitle.innerText;
    }
    if( documentMobileTitle )
    {  
        document.querySelector( '#mobileHeaderTitle' ).innerText = documentMobileTitle.innerText;
    }

    be$( ".goBackLink", mainContent ).forEach( function( backControl )
    {
        var bHasHistory = window.beHistory && window.beHistory.length > 0;
        backControl.style.display = bHasHistory ? "" : "none";
        backControl.onclick = beGoBack;
    }); 

    var nLoadListenersAfter = window.getEventListeners ?
             window.getEventListeners( window )[ "load" ].length : 0;
    console.log( "nLoadListenersAfter = " + nLoadListenersAfter );

    var onloadAfter = window.onload; 

    if( nLoadListenersAfter != nLoadListenersBefore )
    {
        var currentListOfOnloadListeners = window.getEventListeners( window )[ "load" ]; 
        var toRemoveFromOnLoadList = [];  
        for( var onLoadCurrentListener = nLoadListenersBefore; onLoadCurrentListener < nLoadListenersAfter++; onLoadCurrentListener++ )
        {
            console.log( "Executing page's listener #" + onLoadCurrentListener + "..." );
            toRemoveFromOnLoadList.push( currentListOfOnloadListeners[ onLoadCurrentListener ] );
            currentListOfOnloadListeners[ onLoadCurrentListener ]();
        }
        for( var i = 0; i < toRemoveFromOnLoadList.length; i++ )
        {
            console.log( "Removing page's listener #" + ( currentListOfOnloadListeners.length - 1 ) + "..." );
            window.removeEventListener( "load", toRemoveFromOnLoadList[ i ] );
        }
    }
    else if( onloadAfter && ( !onloadBefore || onloadBefore != onloadAfter ) )
    {
        console.log( "Executing page's window.onload..." );
        if( onloadBefore )
        {
            window.onload = onloadBefore;
        }
        else
        {
            window.onload = null;
        }   
        onloadAfter();  
    }     
}

function paramsAreEqual( obj1, obj2 )
{
    var keys1 = Object.keys( obj1 );
    var keys2 = Object.keys( obj2 );

    if( keys1.length !== keys2.length ) 
    {
        return false;
    }

    for( var i in keys1 ) 
    {
       var key = keys1[ i ];
       if( obj1[ key ] !== obj2[ key ] ) 
       {
           return false;
       }
    }

    return true;
}

function loadPageWithProgress( aEl, params, bRefreshPage )
{
    if( document.querySelector( '#dismiss' ).classList.contains('active') )
    {
        document.querySelector( "#dismiss" ).click();
    }

    var formData = null;
    if( params.form )
    {
        var form = params.form; 
        //console.log( "form.id = " + form.id ); 
        if( form.id == "formPropertyInspector" && validate( form ) )
        {
            formData = new FormData();
            formData.append( params.execOp, "Execute" );
            for( var i = 0; i < form.elements.length; i++ )
            {
                var input = form.elements[ i ];
                if( !input.name )
                {
                    continue;
                }
                if( input.name.startsWith( "_internal_" ) )
                {
                    continue;
                }
                var value = input.value;  
                if( input.type == "checkbox" )
                {
                    value = String( input.checked );
                }
                formData.append( input.name, value );
            }
        }
        else if( form.id == "rForm" )
        {
            formData = new FormData();
            formData.append( params.execOp, "1" );          
            //console.log( "" + params.execOp + "=1" ); 
            for( var i = 0; i < form.elements.length; i++ )
            {
                var input = form.elements[ i ];
                if( !input.name )
                {
                    continue;
                }
                if( input.name.startsWith( "_op_" ) )
                {
                    continue;
                }
                var value = input.value;  
                if( input.type == "checkbox" )
                {
                    if( !input.checked )
                    {
                        continue; 
                    }

                    value = input.name.startsWith( "_rec_" ) ? "1" : String( input.checked );
                }
                formData.append( input.name, value );
                //console.log( "" + input.name + "=" + value ); 
            }
        }

        if( !formData )
        {
            return false; 
        }  

        //debugger; 
    }

    document.title = params.title;         
    document.querySelector( '#mobileHeaderTitle' ).innerText = params.title;
    if( aEl )
    {  
        document.querySelectorAll( '.nav-link' ).forEach( function( el ) { el.classList.remove( "active" ); });
        aEl.classList.add( "active" );
    }  

    var progressBar = 
'<div class="progress"> \
<div class="progress-bar progress-bar-striped progress-bar-animated" \
  role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 0%"></div> \
</div>';

    var mainContent = document.querySelector( "#mainContent" );  
    if( !window.beHistory || aEl )
    {
        window.beHistory = [];  
    }

    mainContent.innerHTML = progressBar;

    //console.log( "----------------------------------------------------------" );
    //console.log( params.url );

    var xhr = new XMLHttpRequest();
    xhr.responseType = params.type; 
    xhr.onprogress = function (e) 
    {
        //console.log( "onprogress (e.lengthComputable=" + e.lengthComputable + ") = " + e.loaded );
        var total = e.lengthComputable ? e.total : 20000;
        var percentage = Math.round( e.loaded * 100 / total );
        if( percentage > 100 )
        {
            percentage = 100;
        }
        //console.log( "  percentage = " + percentage );
        //if( percentage < 50 )
        //{
        //    return;  
        //}
        var pbar = document.querySelector( ".progress-bar" );
        pbar.style.width = "" + percentage  + "%";
        pbar.setAttribute( "aria-valuenow", percentage );
    };
    xhr.onloadstart = function( e ) 
    {
        //console.log( "onloadstart" );
    };
    xhr.onreadystatechange = function( e ) 
    {
        var pbar = document.querySelector( ".progress-bar" );
        var percentage = null; 
        if( !params.static && this.readyState == 1 )
        {
            percentage = 50;
        }
        if( this.readyState == 2 )
        {
            //console.log( "readyState == 2" );
            //percentage = 20;
        }
        if( this.readyState == 3 )
        {
            //console.log( "readyState == 3" );
            //percentage = 50;
        }
        if( percentage )
        {
            pbar.style.width = "" + percentage  + "%";
            pbar.setAttribute( "aria-valuenow", percentage );
        }

        //console.log( "onreadystatechange = " + this.readyState );
    };
    xhr.onloadend = function( e ) 
    {
        //console.log( "onloadend" );
        var pbar = document.querySelector( ".progress-bar" );
        pbar.style.width = "99%";
        pbar.setAttribute( "aria-valuenow", 99 );
        if( xhr.status == 200 )
        {
            var html = null;
            if( params.type == 'blob' ) 
            {
                var imgSrc = URL.createObjectURL( xhr.response );
                html = '<img class="w-100 img-fluid d-block mx-auto" src="' + imgSrc + '" />';
            }
            else
            {
                html = xhr.response;
            } 

            var visit = { menuLink: aEl, params: params, content: html };
            if( bRefreshPage )
            {
               visit = window.beHistory.pop();
            }

            beShowPage( html );

            visit.params.title = document.title;

            beSaveHistory( visit );
        }
        else
        {
            var text = "Ошибка " + xhr.status + " при загрузке " + xhr.responseURL;
            document.querySelector( "#mainContent" ).innerHTML = '<div class="alert alert-danger" role="alert">' + text + '</div>';
        }  
    };
    //xhr.onerror = function( e ) 
    //{
    //    console.log( e );
    //};

    if( formData )
    {
        xhr.open( "POST", params.url ); 
        xhr.send( formData );
    }
    else
    {
        xhr.open( "GET", params.url ); 
        xhr.send();
    }

    return true;
}


function initSidebar() 
{
    be$( '#sidebarCollapse', function( control )
    { 
        control.addEventListener( "click", function()
        {
            be$( '.nav-link', function( el ) { el.classList.add( "disabled" ); });
            // fade in the overlay
            be$( '.overlay', function( el ) { el.classList.add( 'active' ); });

            be$( '.sidebar', function( sidebar )
            {
                sidebar.classList.remove( 'd-none' );
                sidebar.classList.add( 'd-sm-block', 'col-sm-4', 'active' );
            });

            be$( '#dismiss', function( el ) { el.classList.add( 'active' ); });
            be$( '.nav-link', function( el ) { el.classList.remove( "disabled" ); });
        });
    });

    be$( '#dismiss, .overlay', function( control )
    { 
        control.addEventListener( "click", function()
        {
            // hide overlay
            be$( '.overlay', function( el ) { el.classList.remove( 'active' ); });
            be$( '#dismiss', function( el ) { el.classList.remove( 'active' ); });

            be$( '.sidebar', function( sidebar )
            {
                sidebar.classList.remove( 'd-sm-block', 'col-sm-4', 'active' );
                sidebar.classList.add( 'd-none' );
            });

            return false;
        });
    });

    be$( '.my-collapsible-item', function( control )
    { 
        control.addEventListener( "click", function( e )
        {
            var downAll = be$( '.feather.feather-chevron-down', this );
            var rightAll = be$( '.feather.feather-chevron-right', this );

            downAll.forEach( function( down )
            { 
                var newIcon = document.createElement( 'span' ); 
                newIcon.innerHTML = feather.icons[ "chevron-right" ].toSvg();
                var parent = down.parentNode;
                parent.insertBefore( newIcon.firstChild, down ); 
                parent.removeChild( down );   
                //down.replaceWith( newIcon.firstChild );
            });

            rightAll.forEach( function( right )
            { 
                var newIcon = document.createElement( 'span' ); 
                newIcon.innerHTML = feather.icons[ "chevron-down" ].toSvg();
                var parent = right.parentNode;
                parent.insertBefore( newIcon.firstChild, right ); 
                parent.removeChild( right );   
                //right.replaceWith( newIcon.firstChild );
            });
        });
    });

    be$( '#searchInput', function( control )
    { 
        control.addEventListener( "keyup", function()
        {
            var value = this.value.toLowerCase();
            Array.prototype.filter.call( document.querySelectorAll( "li.nav-item" ), function( el ) 
            { 
                var cmpText = el.innerText.trim().toLowerCase();
                el.style.display = cmpText.indexOf( value ) > -1 ? "block" : "none";
                console.log( el.innerText.trim() )
            });
        });
    });
}