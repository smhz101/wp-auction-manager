(function( wp ) {
    const { createElement, useEffect, useState } = wp.element;
    const { Table, Spinner } = wp.components;
    const { render } = wp.element;
    const apiFetch = wp.apiFetch;

    function DataTableApp( { endpoint, columns } ) {
        const [ rows, setRows ] = useState( [] );
        const [ loading, setLoading ] = useState( true );

        useEffect( () => {
            apiFetch( { path: endpoint, headers: { 'X-WP-Nonce': wpamTables.nonce } } ).then( ( res ) => {
                setRows( res.data || [] );
                setLoading( false );
            } );
        }, [ endpoint ] );

        if ( loading ) {
            return createElement( Spinner, null );
        }

        return createElement(
            Table,
            { className: 'wpam-table' },
            createElement(
                'thead',
                null,
                createElement(
                    'tr',
                    null,
                    columns.map( ( col ) => createElement( 'th', { key: col.key }, col.label ) )
                )
            ),
            createElement(
                'tbody',
                null,
                rows.map( ( row, index ) =>
                    createElement(
                        'tr',
                        { key: index },
                        columns.map( ( col ) => createElement( 'td', { key: col.key }, row[ col.key ] ) )
                    )
                )
            )
        );
    }

    function mount( id, endpoint, columns ) {
        const root = document.getElementById( id );
        if ( root ) {
            render( createElement( DataTableApp, { endpoint, columns } ), root );
        }
    }

    document.addEventListener( 'DOMContentLoaded', function () {
        mount( 'wpam-auctions-root', wpamTables.auctions_endpoint, [
            { key: 'title', label: wpamTables.i18n.auction },
            { key: 'start', label: wpamTables.i18n.start },
            { key: 'end', label: wpamTables.i18n.end },
            { key: 'state', label: wpamTables.i18n.state },
            { key: 'reason', label: wpamTables.i18n.reason },
        ] );

        if ( wpamTables.auction_id ) {
            mount( 'wpam-bids-root', wpamTables.bids_endpoint + '?auction_id=' + wpamTables.auction_id, [
                { key: 'user', label: wpamTables.i18n.user },
                { key: 'amount', label: wpamTables.i18n.amount },
                { key: 'bid_time', label: wpamTables.i18n.bid_time },
            ] );
        }

        mount( 'wpam-messages-root', wpamTables.messages_endpoint, [
            { key: 'auction', label: wpamTables.i18n.auction },
            { key: 'user', label: wpamTables.i18n.user },
            { key: 'message', label: wpamTables.i18n.message },
            { key: 'status', label: wpamTables.i18n.status },
            { key: 'date', label: wpamTables.i18n.date },
        ] );

        mount( 'wpam-logs-root', wpamTables.logs_endpoint, [
            { key: 'auction', label: wpamTables.i18n.auction },
            { key: 'admin', label: wpamTables.i18n.admin },
            { key: 'action', label: wpamTables.i18n.action },
            { key: 'details', label: wpamTables.i18n.details },
            { key: 'date', label: wpamTables.i18n.date },
        ] );

        mount( 'wpam-flagged-root', wpamTables.flagged_endpoint, [
            { key: 'user', label: wpamTables.i18n.user },
            { key: 'reason', label: wpamTables.i18n.reason_user },
            { key: 'flagged_at', label: wpamTables.i18n.date },
        ] );
    } );
})( window.wp );
