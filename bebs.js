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

function beGoBack( event, index )
{
    if( !window.beHistory || window.beHistory.length < 1 )
    {
        return;
    }

    var isOpExecuted = document.querySelector( "#mainContent #operationBackLink" ) != null;
    var isQueryShown = document.querySelector( "#mainContent #queryBackLink" ) != null;

    var last = window.beHistory[ window.beHistory.length - 1 ];

    if( index !== null && index !== undefined )
    {
        last = window.beHistory[ index ];  
        window.beHistory = window.beHistory.slice( 0, index );   
        beShowPage( last.content, last );
        beSaveHistoryIfNeeded( last );
    }
    else if( isQueryShown )
    {
        window.beHistory.pop(); // remove ouselves
        last = window.beHistory.pop();  
        beShowPage( last.content, last );
        beSaveHistoryIfNeeded( last );
    }
    else if( isOpExecuted )
    {
        last = window.beHistory.pop();  
        last.params.url = last.historyKeyLink; 
        loadPageWithProgress( last.menuLink, last.params );
    }
    else // Cancel button in Form
    {   
        last = window.beHistory.pop();  
        beShowPage( last.content, last );
        beSaveHistoryIfNeeded( last );   
    }

    return false;
}

function beSaveHistoryIfNeeded( visit )
{
    if( !visit.historyKeyLink )
    {
        return;
    }

    delete visit.params.url;
    delete visit.params.form;
    delete visit.params.execOp;

    var bFound = false; 
    for( var i = 0; i < window.beHistory.length; i++ )
    {
        var hist = window.beHistory[ i ];
        if( hist.historyKeyLink == visit.historyKeyLink )
        {
            if( hist.menuLink && !visit.menuLink )
            {
                visit.menuLink = hist.menuLink;
            }
            window.beHistory[ i ] = visit;
            window.beHistory = window.beHistory.slice( 0, i + 1 );
            bFound = true;
            break;
        }
    }

    if( !bFound )
    { 
        window.beHistory.push( visit );
    }

    if( document.getElementById( "breadcrumbContent" ) )
    {
        var brcontent = ""; 
        for( var i = 0; i < beHistory.length - 1; i++ )
        {
            var hvisit = beHistory[ i ];
            if( !brcontent )
            {
                brcontent = '<nav aria-label="breadcrumb"><ol class="breadcrumb">';
            }

            brcontent += '<li class="breadcrumb-item"><a href="#"\
                   onclick="return beGoBack(null,' + i + ')">' + hvisit.params.title + '</a></li>';
/*
            brcontent += '<li class="breadcrumb-item"><a href="#"\
                   onclick="loadPageWithProgress( null, \
                   { \
                       url: \'' + hvisit.historyKeyLink + '\',\
                       title: \'' + hvisit.params.title + '\',\
                       type: \'text\' \
                   } ); return false;">' + hvisit.params.title + '</a></li>';
*/
        }
        if( brcontent )
        {
            brcontent += '<li class="breadcrumb-item active" aria-current="page">' + visit.params.title + '</li>';
            brcontent += '</ol></nav>';
        }  

        document.getElementById( "breadcrumbContent" ).innerHTML = brcontent;
    }

/*
    var prev = window.beHistory.length > 0  ? window.beHistory[ window.beHistory.length - 1 ] : null;
    var bSave = !prev;
    if( !bSave && ( prev.menuLink != visit.menuLink || !paramsAreEqual( visit.params, prev.params ) ) )
    {
        bSave = true;
    }
    if( bSave )
    { 
        window.beHistory.push( visit );
    }
*/
}

function beFixLinks4Bootstrap( div )
{
    if( !div )
    {
        return;  
    }
    var links = div.querySelectorAll( "a" );
    if( !links )
    {
        return;  
    }
    links.forEach( function( link )
    {  
        if( link.onclick )
        {
            //console.log( "Skipped '" + link.href + "' because of " + link.onclick  );
            return; 
        }

        if( !link.classList.contains( "beLink" ) )
        {
            if( !link.target )
            {
                link.target = "_new" + Date.now();   
            }
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

function beShowPage( html, visit )
{
    var mainContent = document.querySelector( "#mainContent" );

    mainContent.innerHTML = ""; 

    var origAddEventListener = window.addEventListener;
    var onloadBefore = window.onload; 

    var pageOnloadListeners = [];
    window.addEventListener = function( type, listener, options )
    {
        if( type === "load" )
        {
            pageOnloadListeners.push( listener );
        }
        else
        {
            origAddEventListener( type, listener, options );
        }
    };
    console.log( "Installed custom addEventListener." );
        
    var container = document.createElement( "div" );
    container.innerHTML = html;

    var isQuery = container.querySelector( "#queryTitleContainer" ) != null;        
    var historyKeyLink = container.querySelector( "#historyKeyLink" ) ? 
        container.querySelector( "#historyKeyLink" ).href : null;  

    if( historyKeyLink )
    {
        visit.historyKeyLink = historyKeyLink;
    } 

    // cache a reference to all the scripts in the container
    var scripts = container.querySelectorAll( "script" );
    // get all child elements and clone them in the target element
    var nodes = container.childNodes;
    for( var i = 0; i < nodes.length; i++ )
    {
        var node = nodes[ i ].cloneNode( true );
        if( node.querySelectorAll && node.nodeName != "SCRIPT" && node.nodeName != "#text" )
        {
            beFixLinks4Bootstrap( node );
        }

        mainContent.appendChild( node );
    }

    // force the found scripts to execute...
    try
    { 
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
    }
    finally
    {
        window.addEventListener = origAddEventListener;
        console.log( "Reverted to original addEventListener." );
    } 

    var documentTitle = container.querySelector( "#documentTitle" );
    var documentMobileTitle = container.querySelector( "#documentMobileTitle" );
    if( documentTitle )
    {  
        document.title = documentTitle.innerText;
        visit.params.title = document.title;
    }
    if( documentMobileTitle )
    {  
        document.querySelector( '#mobileHeaderTitle' ).innerText = documentMobileTitle.innerText;
    }

    be$( ".goBackLink", mainContent ).forEach( function( backControl )
    {
        var bHasHistory = window.beHistory && window.beHistory.length > 0;
        if( bHasHistory && isQuery )
        {
            if( window.beHistory.length == 1 && historyKeyLink == window.beHistory[ 0 ].historyKeyLink )
            {
                bHasHistory = false;
            }
        }

        backControl.style.display = bHasHistory ? "" : "none";
        backControl.onclick = beGoBack;
    }); 

    var nLoadListenersAfter = window.getEventListeners ?
             window.getEventListeners( window )[ "load" ].length : 0;

    var onloadAfter = window.onload; 

    if( pageOnloadListeners.length > 0 )
    {
        for( var onLoadCurrentListener = 0; onLoadCurrentListener < pageOnloadListeners.length; onLoadCurrentListener++ )
        {
            if( pageOnloadListeners[ onLoadCurrentListener ].name )
            {
                console.log( "Executing page's listener #" + onLoadCurrentListener + " [" + 
                    pageOnloadListeners[ onLoadCurrentListener ].name + "]..." );
            }
            else
            { 
                console.log( "Executing page's listener #" + onLoadCurrentListener + "..." );
            }
            try
            { 
                pageOnloadListeners[ onLoadCurrentListener ]();
            }
            catch( e )
            {
                console.log( e );
            }  
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

    var splitter = document.getElementById( "splitterPlaceholder" );
    if( splitter )
    {
        var xhr = new XMLHttpRequest();
        xhr.responseType = "text"; 
        xhr.onloadend = function( e ) 
        {
            if( xhr.status == 200 )
            {
                var splitop = document.createElement( "div" );
                splitop.innerHTML = xhr.response;

                // cache a reference to all the scripts in the container
                var scripts = splitop.querySelectorAll( "script" );
                // get all child elements and clone them in the target element
                var nodes = splitop.childNodes;
                for( var i = 0; i < nodes.length; i++ )
                {
                    var node = nodes[ i ].cloneNode( true );
                    splitter.appendChild( node );
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
                    try
                    {
                        document.head.appendChild(script);
                    }
                    catch( e )
                    {
                        console.log( "Page contains a script causing an error:" );
                        console.log( e );
                    }
                    document.head.removeChild(script);
                }

               // splitter.innerHTML = xhr.response;
                splitter.id = "splitter";
            }   
        }

        xhr.open( "GET", splitter.getAttribute( "paramFrame" ) ); 
        xhr.send();
    }  

    feather.replace();

    return isQuery; 
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

    var customSend = null;
    var formData = null;
    if( params.form )
    {
        var form = params.form; 
        //console.log( "form.id = " + form.id ); 
        if( form.id == "formPropertyInspector" && params.reload )
        {
            formData = new FormData();            
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

                if( input.type == "file" )
                {
                }
                else
                {
                    formData.append( input.name, value );
                }
            }
        }
        else if( form.id == "formPropertyInspector" && validate( form ) )
        {
            customSend = params.send;  
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

                if( input.type == "file" )
                {
                    formData.append( input.name, input.files[ 0 ] );
                }
                else
                {
                    formData.append( input.name, value );
                }
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
        document.querySelectorAll( '.progress-bar' ).forEach( function( pbar ) {     
            pbar.style.width = "" + percentage  + "%";
            pbar.setAttribute( "aria-valuenow", percentage );
        });  
    };
    xhr.onloadstart = function( e ) 
    {
        //console.log( "onloadstart" );
    };
    xhr.onreadystatechange = function( e ) 
    {
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
            document.querySelectorAll( '.progress-bar' ).forEach( function( pbar ) {     
                pbar.style.width = "" + percentage  + "%";
                pbar.setAttribute( "aria-valuenow", percentage );
            });  
        }

        //console.log( "onreadystatechange = " + this.readyState );
    };
    xhr.onloadend = function( e ) 
    {
        //console.log( "onloadend" );
        var pbar = document.querySelector( ".progress-bar" );
        document.querySelectorAll( '.progress-bar' ).forEach( function( pbar ) {     
            pbar.style.width = "99%";
            pbar.setAttribute( "aria-valuenow", 99 );
        });  

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

            beShowPage( html, visit );

            beSaveHistoryIfNeeded( visit );
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


    var progressBar = 
'<span class="align-middle d-none d-xl-block" \
   style="position: absolute; top: 50%; left: 40%; margin-top: -1.5rem; margin-left: -20%; width: 75%; height: 3rem;">\
<div class="progress"> \
<div class="progress-bar progress-bar-striped progress-bar-animated" \
  role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 0%"></div> \
</div>\
</span>\
\
<span class="align-middle d-none d-lg-block d-xl-none" \
   style="position: absolute; top: 50%; left: 50%; margin-top: -1.5rem; margin-left: -20%; width: 65%; height: 3rem;">\
<div class="progress"> \
<div class="progress-bar progress-bar-striped progress-bar-animated" \
  role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 0%"></div> \
</div>\
</span>\
\
<div class="spinner-border text-primary d-lg-none d-block" \
   style="position: absolute; top: 50%; left: 50%; margin-top: -2.5rem; margin-left: -2.5rem; width: 5rem; height: 5rem;" \
   role="status"> \
     <span class="visually-hidden">Loading...</span>\
</div>\
';

    var mainContent = document.querySelector( "#mainContent" );  

    if( customSend )
    {
        customSend( params.form, function()
        {
            document.title = params.title;         
            document.querySelector( '#mobileHeaderTitle' ).innerText = params.title;
            if( aEl )
            {  
                document.querySelectorAll( '.nav-link' ).forEach( function( el ) { el.classList.remove( "active" ); });
                aEl.classList.add( "active" );
            }  

            if( !window.beHistory || aEl )
            {
                window.beHistory = [];  
            }

            mainContent.innerHTML = progressBar;

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
        });  
    }
    else
    {   
        document.title = params.title;         
        document.querySelector( '#mobileHeaderTitle' ).innerText = params.title;
        if( aEl )
        {  
            document.querySelectorAll( '.nav-link' ).forEach( function( el ) { el.classList.remove( "active" ); });
            aEl.classList.add( "active" );
        }  

        if( !window.beHistory || aEl )
        {
            window.beHistory = [];  
        }

        mainContent.innerHTML = progressBar;

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
    }

    return true;
}

function clickCollapsible( collapsible, state ) 
{
    var downAll = be$( '.feather.feather-chevron-down', collapsible );
    var rightAll = be$( '.feather.feather-chevron-right', collapsible );

    // already
    if( state && state == "collapsed" && rightAll && rightAll.length > 0 )
    {
        return;
    }
    if( state && state == "shown" && downAll && downAll.length > 0 )
    {
        return;
    }

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
        control.addEventListener( "click", function()
        {
            clickCollapsible( control );
        });
    });

    var navItemInitialStates = [];

    //console.log( navItemInitialStates );

    be$( '#searchInput', function( control )
    { 
        control.addEventListener( "keyup", function()
        {
            if( navItemInitialStates.length == 0 )
            {
                Array.prototype.filter.call( document.querySelectorAll( "li.nav-item" ), function( el ) 
                { 
                    var isCollapsible = el.classList.contains( "my-collapsible-item" ); 
                    if( !isCollapsible )
                    {
                        return; 
                    }

                    var group = document.querySelector( el.children[ 0 ].hash );
                    var collapsible = el;
                    //var collapsible = group.parentNode;
                    navItemInitialStates.push( { collapsible: collapsible, group: group, show: group.classList.contains( "show" ) } );  
                });
            }
 
            var value = this.value.toLowerCase();
            if( !value )
            {
                //console.log( "--------------------------------------------------------" );
                Array.prototype.filter.call( document.querySelectorAll( "li.nav-item" ), function( el ) 
                { 
                    el.style.display = "block";
                });
                for( var i = 0; i < navItemInitialStates.length; i++ )
                {
                    var nav = navItemInitialStates[ i ];
                    if( nav.group.classList.contains( "show" ) && !nav.show )
                    {
                        nav.group.classList.remove( "show" )    
                        clickCollapsible( nav.collapsible, "collapsed" );
                        //clickCollapsible( nav.collapsible );
                        //console.log( "hide" );
                        //console.log( nav.collapsible );
                    }
                    else if( !nav.group.classList.contains( "show" ) && nav.show )
                    {
                        nav.group.classList.add( "show" )    
                        clickCollapsible( nav.collapsible, "shown" );
                        //clickCollapsible( nav.collapsible );
                        //console.log( "show" );
                        //console.log( nav.collapsible );
                    }
                }

                navItemInitialStates.length = 0;  
                //console.log( "&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&" );
                return;
            }

            Array.prototype.filter.call( document.querySelectorAll( "li.nav-item" ), function( el ) 
            { 
                // first, hide all parent nodes - we will show them later if there are visible children
                var isCollapsible = el.classList.contains( "my-collapsible-item" ); 
                if( isCollapsible )
                {
                    el.style.display = "none";
                    return;   
                }

                var cmpText = el.innerText.trim().toLowerCase();
                var isVisible = cmpText.indexOf( value ) != -1;
                el.style.display = isVisible ? "block" : "none";
                var group = el.parentNode;
                if( isVisible )
                {
                    // now, show the parent   
                    while( group && group.id )
                    {
                        var groupEl = document.getElementById( group.id ); 
                        var bMadeShown = false;
                        if( !groupEl.classList.contains( "show" ) )
                        {
                            groupEl.classList.add( "show" );
                            bMadeShown = true;
                        }  
                        var selector = ".nav-link[href='#" + group.id + "']";
                        //console.log( selector );
                        var psel = document.querySelector( selector );
                        //console.log( psel );
                        if( psel ) 
                        {   
                            var collapsible = psel.parentNode;                            
                            collapsible.style.display = "block";
                            if( bMadeShown )
                            {
                                clickCollapsible( collapsible, "shown" );
                            }
                            // process upper parent
                            group = collapsible.parentNode; 
                        }
                        else
                        {
                            group = null;
                        }
                    }    
                }
                //console.log( el.innerText.trim() )
            });
        });
    });
}