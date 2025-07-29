(function( wp ) {
    const { createElement, useEffect, useState } = wp.element;
    const apiFetch = wp.apiFetch;

    function AuctionList() {
        const [ auctions, setAuctions ] = useState( [] );

        useEffect( () => {
            apiFetch( { path: '/wp-json/wp/v2/product?per_page=10' } ).then( setAuctions );
        }, [] );

        return createElement(
            'div',
            { className: 'wpam-auction-list' },
            auctions.map( ( auction ) =>
                createElement(
                    'div',
                    { key: auction.id },
                    createElement( 'a', { href: auction.link }, auction.title.rendered )
                )
            )
        );
    }

    function SingleAuction( { auctionId } ) {
        const [ auction, setAuction ] = useState( null );

        useEffect( () => {
            if ( ! auctionId ) return;
            apiFetch( { path: '/wp-json/wp/v2/product/' + auctionId } ).then( setAuction );
        }, [ auctionId ] );

        if ( ! auction ) {
            return createElement( 'div', null, 'Loading...' );
        }

        return createElement(
            'div',
            { className: 'wpam-auction-single' },
            createElement( 'h2', null, auction.title.rendered )
        );
    }

    function App() {
        const auctionId = parseInt( window.wpamReactPage.auction_id, 10 );
        return auctionId
            ? createElement( SingleAuction, { auctionId } )
            : createElement( AuctionList, null );
    }

    document.addEventListener( 'DOMContentLoaded', function() {
        const root = document.getElementById( 'wpam-react-root' );
        if ( root ) {
            wp.element.render( createElement( App, null ), root );
        }
    } );
})( window.wp );
