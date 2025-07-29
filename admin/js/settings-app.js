(function( wp ) {
    const { createElement, render, useState, useEffect } = wp.element;
    const { TextControl, CheckboxControl, Button } = wp.components;
    const apiFetch = wp.apiFetch;

    function SettingsApp() {
        const [ settings, setSettings ] = useState( null );
        const [ saving, setSaving ] = useState( false );

        useEffect( () => {
            apiFetch( { path: wpamSettings.rest_url, headers: { 'X-WP-Nonce': wpamSettings.nonce } } ).then( setSettings );
        }, [] );

        if ( ! settings ) {
            return createElement( 'p', null, 'Loading...' );
        }

        function updateField( field, value ) {
            setSettings( { ...settings, [ field ]: value } );
        }

        function saveSettings() {
            setSaving( true );
            apiFetch( {
                path: wpamSettings.rest_url,
                method: 'POST',
                data: settings,
                headers: { 'X-WP-Nonce': wpamSettings.nonce },
            } ).then( ( response ) => {
                setSettings( response );
                setSaving( false );
            } );
        }

        return createElement( 'div', null,
            createElement( TextControl, {
                label: 'Default Increment',
                value: settings.wpam_default_increment || '',
                onChange: ( v ) => updateField( 'wpam_default_increment', v )
            } ),
            createElement( TextControl, {
                label: 'Soft Close Threshold (sec)',
                value: settings.wpam_soft_close_threshold || '',
                onChange: ( v ) => updateField( 'wpam_soft_close_threshold', v )
            } ),
            createElement( TextControl, {
                label: 'Extension Duration (sec)',
                value: settings.wpam_soft_close_extend || '',
                onChange: ( v ) => updateField( 'wpam_soft_close_extend', v )
            } ),
            createElement( CheckboxControl, {
                label: 'Enable Twilio Notifications',
                checked: !! settings.wpam_enable_twilio,
                onChange: ( v ) => updateField( 'wpam_enable_twilio', v ? 1 : 0 )
            } ),
            createElement( TextControl, {
                label: 'Twilio SID',
                value: settings.wpam_twilio_sid || '',
                onChange: ( v ) => updateField( 'wpam_twilio_sid', v )
            } ),
            createElement( Button, { isPrimary: true, isBusy: saving, onClick: saveSettings }, saving ? 'Saving...' : 'Save Settings' )
        );
    }

    document.addEventListener( 'DOMContentLoaded', function() {
        const root = document.getElementById( 'wpam-settings-root' );
        if ( root ) {
            render( createElement( SettingsApp ), root );
        }
    } );
})( window.wp );
