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

function loadPageWithProgress( aEl, params )
{
    if( document.querySelector( '#dismiss' ).classList.contains('active') )
    {
        document.querySelector( "#dismiss" ).click();
    }

    document.title = params.title;         
    document.querySelector( '#mobileHeaderTitle' ).innerText = params.title;
    document.querySelectorAll( '.nav-link' ).forEach( function( el ) { el.classList.remove( "active" ); });
    aEl.classList.add( "active" );

    var progressBar = 
'<div class="progress"> \
<div class="progress-bar progress-bar-striped progress-bar-animated" \
  role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 0%"></div> \
</div>';

    document.querySelector( "#mainContent" ).innerHTML = progressBar;

    console.log( "----------------------------------------------------------" );
    console.log( params.url );

    var xhr = new XMLHttpRequest();
    xhr.open( "GET", params.url );
    xhr.responseType = params.type; 
    xhr.onprogress = function (e) 
    {
        console.log( "onprogress = " + e.loaded );
        var total = e.lengthComputable ? e.total : 5000;
        var percentage = Math.round( e.loaded * 100 / total );
        if( percentage > 100 )
        {
            percentage = 100;
        }
        var pbar = document.querySelector( ".progress-bar" );
        pbar.style.width = "" + percentage  + "%";
        pbar.setAttribute( "aria-valuenow", percentage );
    };
    xhr.onloadstart = function( e ) 
    {
        console.log( "onloadstart" );
        var pbar = document.querySelector( ".progress-bar" );
        console.log( pbar ); 
        pbar.style.width = "50%";
        pbar.setAttribute( "aria-valuenow", 50 );
    };
    xhr.onloadend = function( e ) 
    {
        console.log( "onloadend" );
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
            document.querySelector( "#mainContent" ).innerHTML = html;
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
    xhr.send();
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