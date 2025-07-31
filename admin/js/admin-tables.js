/**
 * Admin tables rendered with Gutenberg DataViews.
 */
( function ( wp ) {
    const { createElement, useEffect, useState, useMemo } = wp.element;
    const { Spinner } = wp.components;
    const { DataViews, DEFAULT_VIEW, filterSortAndPaginate } =
        wp.dataviews || {};
    const { render } = wp.element;
    const apiFetch = wp.apiFetch;

    function DataViewApp( { endpoint, fields } ) {
        const [ data, setData ] = useState( [] );
        const [ loading, setLoading ] = useState( true );
        const [ view, setView ] = useState( {
            ...DEFAULT_VIEW,
            fields: fields.map( ( f ) => f.id ),
        } );

        useEffect( () => {
            apiFetch( {
                path: endpoint,
                headers: { 'X-WP-Nonce': wpamTables.nonce },
            } ).then( ( res ) => {
                setData( res.data || [] );
                setLoading( false );
            } );
        }, [ endpoint ] );

        const { data: shownData, paginationInfo } = useMemo( () => {
            return filterSortAndPaginate( data, view, fields );
        }, [ data, view ] );

        if ( loading || ! DataViews ) {
            return createElement( Spinner, null );
        }

        return createElement( DataViews, {
            getItemId: ( item ) => item.id?.toString() || '',
            paginationInfo,
            data: shownData,
            view,
            fields,
            onChangeView: setView,
            isItemClickable: () => false,
        } );
    }

    function mount( id, endpoint, fields ) {
        const root = document.getElementById( id );
        if ( root ) {
            render( createElement( DataViewApp, { endpoint, fields } ), root );
        }
    }

    document.addEventListener( 'DOMContentLoaded', function () {
        mount( 'wpam-auctions-root', wpamTables.auctions_endpoint, [
            { id: 'title', label: wpamTables.i18n.auction, getValue: ( { item } ) => item.title },
            { id: 'start', label: wpamTables.i18n.start, getValue: ( { item } ) => item.start },
            { id: 'end', label: wpamTables.i18n.end, getValue: ( { item } ) => item.end },
            { id: 'state', label: wpamTables.i18n.state, getValue: ( { item } ) => item.state },
            { id: 'reason', label: wpamTables.i18n.reason, getValue: ( { item } ) => item.reason },
        ] );

        if ( wpamTables.auction_id ) {
            mount( 'wpam-bids-root', wpamTables.bids_endpoint + '?auction_id=' + wpamTables.auction_id, [
                { id: 'user', label: wpamTables.i18n.user, getValue: ( { item } ) => item.user },
                { id: 'amount', label: wpamTables.i18n.amount, getValue: ( { item } ) => item.amount },
                { id: 'bid_time', label: wpamTables.i18n.bid_time, getValue: ( { item } ) => item.bid_time },
            ] );
        }

        mount( 'wpam-messages-root', wpamTables.messages_endpoint, [
            { id: 'auction', label: wpamTables.i18n.auction, getValue: ( { item } ) => item.auction },
            { id: 'user', label: wpamTables.i18n.user, getValue: ( { item } ) => item.user },
            { id: 'message', label: wpamTables.i18n.message, getValue: ( { item } ) => item.message },
            { id: 'status', label: wpamTables.i18n.status, getValue: ( { item } ) => item.status },
            { id: 'date', label: wpamTables.i18n.date, getValue: ( { item } ) => item.date },
        ] );

        mount( 'wpam-logs-root', wpamTables.logs_endpoint, [
            { id: 'auction', label: wpamTables.i18n.auction, getValue: ( { item } ) => item.auction },
            { id: 'admin', label: wpamTables.i18n.admin, getValue: ( { item } ) => item.admin },
            { id: 'action', label: wpamTables.i18n.action, getValue: ( { item } ) => item.action },
            { id: 'details', label: wpamTables.i18n.details, getValue: ( { item } ) => item.details },
            { id: 'date', label: wpamTables.i18n.date, getValue: ( { item } ) => item.date },
        ] );

        mount( 'wpam-flagged-root', wpamTables.flagged_endpoint, [
            { id: 'user', label: wpamTables.i18n.user, getValue: ( { item } ) => item.user },
            { id: 'reason', label: wpamTables.i18n.reason_user, getValue: ( { item } ) => item.reason },
            { id: 'flagged_at', label: wpamTables.i18n.date, getValue: ( { item } ) => item.flagged_at },
        ] );
    } );
})( window.wp );
