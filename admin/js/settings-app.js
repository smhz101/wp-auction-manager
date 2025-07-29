(function( wp ) {
    const { createElement, render, useState, useEffect } = wp.element;
    const {
        TextControl,
        CheckboxControl,
        Button,
        SelectControl,
        TabPanel,
        Notice,
    } = wp.components;
    const apiFetch = wp.apiFetch;

    function SettingsApp() {
        const [ settings, setSettings ] = useState( null );
        const [ saving, setSaving ] = useState( false );
        const [ errors, setErrors ] = useState( {} );
        const [ notice, setNotice ] = useState( '' );

        useEffect( () => {
            apiFetch( { path: wpamSettings.rest_url, headers: { 'X-WP-Nonce': wpamSettings.nonce } } ).then( setSettings );
        }, [] );

        if ( ! settings ) {
            return createElement( 'p', null, 'Loading...' );
        }

        function updateField( field, value ) {
            setSettings( { ...settings, [ field ]: value } );
            if ( errors[ field ] ) {
                const newErrors = { ...errors };
                delete newErrors[ field ];
                setErrors( newErrors );
            }
        }

        function saveSettings() {
            const newErrors = {};
            const increment = parseFloat( settings.wpam_default_increment );
            if ( isNaN( increment ) || increment <= 0 ) {
                newErrors.wpam_default_increment = 'Enter a positive number.';
            }

            const threshold = parseInt( settings.wpam_soft_close_threshold, 10 );
            if ( isNaN( threshold ) || threshold < 0 ) {
                newErrors.wpam_soft_close_threshold = 'Must be zero or more.';
            }

            const extend = parseInt( settings.wpam_soft_close_extend, 10 );
            if ( isNaN( extend ) || extend <= 0 ) {
                newErrors.wpam_soft_close_extend = 'Enter a positive number.';
            }

            if ( settings.wpam_enable_twilio ) {
                if ( ! settings.wpam_twilio_sid ) {
                    newErrors.wpam_twilio_sid = 'Required when Twilio is enabled.';
                }
                if ( ! settings.wpam_twilio_token ) {
                    newErrors.wpam_twilio_token = 'Required when Twilio is enabled.';
                }
                if ( ! settings.wpam_twilio_from ) {
                    newErrors.wpam_twilio_from = 'Required when Twilio is enabled.';
                }
            }

            if ( Object.keys( newErrors ).length ) {
                setErrors( newErrors );
                return;
            }

            setSaving( true );
            apiFetch( {
                path: wpamSettings.rest_url,
                method: 'POST',
                data: settings,
                headers: { 'X-WP-Nonce': wpamSettings.nonce },
            } ).then( ( response ) => {
                setSettings( response );
                setSaving( false );
                setNotice( 'Settings saved.' );
                setTimeout( () => setNotice( '' ), 3000 );
            } );
        }

        function renderGeneral() {
            return createElement( 'div', null,
                createElement( TextControl, {
                    label: 'Default Increment',
                    help: 'Base increase for bids when no increment is set.',
                    value: settings.wpam_default_increment || '',
                    onChange: ( v ) => updateField( 'wpam_default_increment', v ),
                    error: errors.wpam_default_increment,
                } ),
                createElement( TextControl, {
                    label: 'Soft Close Threshold (sec)',
                    help: 'Extend auction when a bid is placed within this time.',
                    value: settings.wpam_soft_close_threshold || '',
                    onChange: ( v ) => updateField( 'wpam_soft_close_threshold', v ),
                    error: errors.wpam_soft_close_threshold,
                } ),
                createElement( TextControl, {
                    label: 'Extension Duration (sec)',
                    help: 'How long to extend the auction when soft close triggers.',
                    value: settings.wpam_soft_close_extend || '',
                    onChange: ( v ) => updateField( 'wpam_soft_close_extend', v ),
                    error: errors.wpam_soft_close_extend,
                } ),
                createElement( CheckboxControl, {
                    label: 'Require KYC Verification',
                    help: 'Users must verify identity before bidding.',
                    checked: !! settings.wpam_require_kyc,
                    onChange: ( v ) => updateField( 'wpam_require_kyc', v ? 1 : 0 )
                } )
            );
        }

        function renderNotifications() {
            return createElement( 'div', null,
                createElement( CheckboxControl, {
                    label: 'Enable Twilio Notifications',
                    help: 'Send SMS messages using Twilio.',
                    checked: !! settings.wpam_enable_twilio,
                    onChange: ( v ) => updateField( 'wpam_enable_twilio', v ? 1 : 0 )
                } ),
                createElement( TextControl, {
                    label: 'Twilio SID',
                    help: 'Your Twilio account SID.',
                    value: settings.wpam_twilio_sid || '',
                    onChange: ( v ) => updateField( 'wpam_twilio_sid', v ),
                    error: errors.wpam_twilio_sid,
                } ),
                createElement( TextControl, {
                    label: 'Twilio Token',
                    help: 'Your Twilio auth token.',
                    value: settings.wpam_twilio_token || '',
                    onChange: ( v ) => updateField( 'wpam_twilio_token', v ),
                    error: errors.wpam_twilio_token,
                } ),
                createElement( TextControl, {
                    label: 'Twilio From Number',
                    help: 'Phone number SMS will be sent from.',
                    value: settings.wpam_twilio_from || '',
                    onChange: ( v ) => updateField( 'wpam_twilio_from', v ),
                    error: errors.wpam_twilio_from,
                } ),
                createElement( TextControl, {
                    label: 'SendGrid API Key',
                    help: 'Used for sending email notifications.',
                    value: settings.wpam_sendgrid_key || '',
                    onChange: ( v ) => updateField( 'wpam_sendgrid_key', v ),
                    error: errors.wpam_sendgrid_key,
                } ),
                createElement( CheckboxControl, {
                    label: 'Enable Firebase',
                    help: 'Push notifications via Firebase Cloud Messaging.',
                    checked: !! settings.wpam_enable_firebase,
                    onChange: ( v ) => updateField( 'wpam_enable_firebase', v ? 1 : 0 )
                } ),
                createElement( TextControl, {
                    label: 'Firebase Server Key',
                    help: 'Server key from your Firebase project.',
                    value: settings.wpam_firebase_server_key || '',
                    onChange: ( v ) => updateField( 'wpam_firebase_server_key', v ),
                    error: errors.wpam_firebase_server_key,
                } )
            );
        }

        function renderRealtime() {
            return createElement( 'div', null,
                createElement( SelectControl, {
                    label: 'Realtime Provider',
                    help: 'Service used for realtime updates.',
                    value: settings.wpam_realtime_provider || 'none',
                    options: [
                        { label: 'None', value: 'none' },
                        { label: 'Pusher', value: 'pusher' },
                    ],
                    onChange: ( v ) => updateField( 'wpam_realtime_provider', v )
                } ),
                createElement( TextControl, {
                    label: 'Pusher App ID',
                    help: 'Required when using Pusher.',
                    value: settings.wpam_pusher_app_id || '',
                    onChange: ( v ) => updateField( 'wpam_pusher_app_id', v ),
                    error: errors.wpam_pusher_app_id,
                } ),
                createElement( TextControl, {
                    label: 'Pusher Key',
                    help: 'Required when using Pusher.',
                    value: settings.wpam_pusher_key || '',
                    onChange: ( v ) => updateField( 'wpam_pusher_key', v ),
                    error: errors.wpam_pusher_key,
                } ),
                createElement( TextControl, {
                    label: 'Pusher Secret',
                    help: 'Required when using Pusher.',
                    value: settings.wpam_pusher_secret || '',
                    onChange: ( v ) => updateField( 'wpam_pusher_secret', v ),
                    error: errors.wpam_pusher_secret,
                } ),
                createElement( TextControl, {
                    label: 'Pusher Cluster',
                    help: 'Required when using Pusher.',
                    value: settings.wpam_pusher_cluster || '',
                    onChange: ( v ) => updateField( 'wpam_pusher_cluster', v ),
                    error: errors.wpam_pusher_cluster,
                } )
            );
        }

        return createElement( 'div', null,
            notice && createElement( Notice, { status: 'success', isDismissible: false }, notice ),
            createElement( TabPanel, {
                className: 'wpam-settings-tabs',
                tabs: [
                    { name: 'general', title: 'General' },
                    { name: 'notifications', title: 'Notifications' },
                    { name: 'realtime', title: 'Realtime' },
                ],
            }, ( tab ) => {
                if ( tab.name === 'general' ) {
                    return renderGeneral();
                }
                if ( tab.name === 'notifications' ) {
                    return renderNotifications();
                }
                if ( tab.name === 'realtime' ) {
                    return renderRealtime();
                }
                return null;
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
