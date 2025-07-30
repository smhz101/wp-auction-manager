(function (wp) {
  const { createElement, render, useState, useEffect } = wp.element;
  const { TextControl, ToggleControl, Tooltip, Button, SelectControl, TabPanel, Notice } =
    wp.components;
  const apiFetch = wp.apiFetch;

  function SettingsApp() {
    const [settings, setSettings] = useState(null);
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});
    const [notice, setNotice] = useState('');

    function labelWithTip(label, tip) {
      return wp.element.createElement(
        'span',
        null,
        label,
        ' ',
        wp.element.createElement(
          Tooltip,
          { text: tip },
          wp.element.createElement('span', { className: 'dashicons dashicons-info' })
        )
      );
    }

    function validateRequiredKeys(opts) {
      const newErrors = { ...errors };
      if (opts.wpam_enable_twilio) {
        if (!opts.wpam_twilio_sid) {
          newErrors.wpam_twilio_sid = 'Required when Twilio is enabled.';
        } else {
          delete newErrors.wpam_twilio_sid;
        }
        if (!opts.wpam_twilio_token) {
          newErrors.wpam_twilio_token = 'Required when Twilio is enabled.';
        } else {
          delete newErrors.wpam_twilio_token;
        }
        if (!opts.wpam_twilio_from) {
          newErrors.wpam_twilio_from = 'Required when Twilio is enabled.';
        } else {
          delete newErrors.wpam_twilio_from;
        }
      } else {
        delete newErrors.wpam_twilio_sid;
        delete newErrors.wpam_twilio_token;
        delete newErrors.wpam_twilio_from;
      }
      if (opts.wpam_enable_firebase) {
        if (!opts.wpam_firebase_server_key) {
          newErrors.wpam_firebase_server_key = 'Server key required when Firebase is enabled.';
        } else {
          delete newErrors.wpam_firebase_server_key;
        }
      } else {
        delete newErrors.wpam_firebase_server_key;
      }
      if (opts.wpam_realtime_provider === 'pusher') {
        if (!opts.wpam_pusher_app_id) {
          newErrors.wpam_pusher_app_id = 'Required when using Pusher.';
        } else {
          delete newErrors.wpam_pusher_app_id;
        }
        if (!opts.wpam_pusher_key) {
          newErrors.wpam_pusher_key = 'Required when using Pusher.';
        } else {
          delete newErrors.wpam_pusher_key;
        }
        if (!opts.wpam_pusher_secret) {
          newErrors.wpam_pusher_secret = 'Required when using Pusher.';
        } else {
          delete newErrors.wpam_pusher_secret;
        }
        if (!opts.wpam_pusher_cluster) {
          newErrors.wpam_pusher_cluster = 'Required when using Pusher.';
        } else {
          delete newErrors.wpam_pusher_cluster;
        }
      } else {
        delete newErrors.wpam_pusher_app_id;
        delete newErrors.wpam_pusher_key;
        delete newErrors.wpam_pusher_secret;
        delete newErrors.wpam_pusher_cluster;
      }
      setErrors(newErrors);
    }

    useEffect(() => {
      apiFetch({
        path: wpamSettings.rest_endpoint,
        headers: { 'X-WP-Nonce': wpamSettings.nonce },
      }).then(setSettings);
    }, []);
    useEffect(() => {
      if (settings) {
        validateRequiredKeys(settings);
      }
    }, [settings]);

    if (!settings) {
      return createElement('p', null, 'Loading...');
    }

    function updateField(field, value) {
      const newSettings = { ...settings, [field]: value };
      setSettings(newSettings);
      if (errors[field]) {
        const newErrors = { ...errors };
        delete newErrors[field];
        setErrors(newErrors);
      }
      validateRequiredKeys(newSettings);
    }

    function saveSettings() {
      const newErrors = {};
      let hasError = false;

      const increment = parseFloat(settings.wpam_default_increment);
      if (isNaN(increment) || increment <= 0) {
        newErrors.wpam_default_increment = 'Enter a positive number.';
        hasError = true;
      }

      if (settings.wpam_soft_close) {
        const sc = parseInt(settings.wpam_soft_close, 10);
        if (isNaN(sc) || sc < 0) {
          newErrors.wpam_soft_close = 'Must be zero or more.';
          hasError = true;
        }
      }

      if (settings.wpam_buyer_premium) {
        const prem = parseFloat(settings.wpam_buyer_premium);
        if (isNaN(prem) || prem < 0) {
          newErrors.wpam_buyer_premium = 'Must be zero or more.';
          hasError = true;
        }
      }

      if (settings.wpam_seller_fee) {
        const fee = parseFloat(settings.wpam_seller_fee);
        if (isNaN(fee) || fee < 0) {
          newErrors.wpam_seller_fee = 'Must be zero or more.';
          hasError = true;
        }
      }

      const threshold = parseInt(settings.wpam_soft_close_threshold, 10);
      if (isNaN(threshold) || threshold < 0) {
        newErrors.wpam_soft_close_threshold = 'Must be zero or more.';
        hasError = true;
      }

      const extend = parseInt(settings.wpam_soft_close_extend, 10);
      if (isNaN(extend) || extend <= 0) {
        newErrors.wpam_soft_close_extend = 'Enter a positive number.';
        hasError = true;
      }

      const maxExt = parseInt(settings.wpam_max_extensions, 10);
      if (isNaN(maxExt) || maxExt < 0) {
        newErrors.wpam_max_extensions = 'Must be zero or more.';
        hasError = true;
      }

      if (settings.wpam_enable_twilio) {
        if (!settings.wpam_twilio_sid) {
          newErrors.wpam_twilio_sid = 'Required when Twilio is enabled.';
          hasError = true;
        }
        if (!settings.wpam_twilio_token) {
          newErrors.wpam_twilio_token = 'Required when Twilio is enabled.';
          hasError = true;
        }
        if (!settings.wpam_twilio_from) {
          newErrors.wpam_twilio_from = 'Required when Twilio is enabled.';
          hasError = true;
        }
      }

      if (hasError) {
        setErrors(newErrors);
        setNotice('Please fix the highlighted errors before saving.');
        return;
      }

      setSaving(true);
      setNotice(''); // Clear previous notices

      apiFetch({
        path: wpamSettings.rest_endpoint,
        method: 'POST',
        data: settings,
        headers: { 'X-WP-Nonce': wpamSettings.nonce },
      })
        .then((response) => {
          setSettings(response);
          setSaving(false);
          setErrors({});
          setNotice('Settings saved.');
          setTimeout(() => setNotice(''), 3000);
        })
        .catch((err) => {
          setSaving(false);
          setNotice('Failed to save settings. Please try again.');
          console.error('Save failed:', err);
        });
    }

    function renderGeneral() {
      return createElement(
        'div',
        null,
        createElement(TextControl, {
          label: 'Default Increment',
          help: 'Base increase for bids when no increment is set.',
          value: settings.wpam_default_increment || '',
          onChange: (v) => updateField('wpam_default_increment', v),
          error: errors.wpam_default_increment,
        }),
        createElement(TextControl, {
          label: 'Soft Close Threshold (sec)',
          help: 'Extend auction when a bid is placed within this time.',
          value: settings.wpam_soft_close_threshold || '',
          onChange: (v) => updateField('wpam_soft_close_threshold', v),
          error: errors.wpam_soft_close_threshold,
        }),
        createElement(TextControl, {
          label: 'Extension Duration (sec)',
          help: 'How long to extend the auction when soft close triggers.',
          value: settings.wpam_soft_close_extend || '',
          onChange: (v) => updateField('wpam_soft_close_extend', v),
          error: errors.wpam_soft_close_extend,
        }),
        createElement(TextControl, {
          label: 'Maximum Extensions',
          help: 'Limit how many times an auction can be extended. 0 = unlimited.',
          value: settings.wpam_max_extensions || '',
          onChange: (v) => updateField('wpam_max_extensions', v),
          error: errors.wpam_max_extensions,
        }),
        createElement(ToggleControl, {
          label: labelWithTip(
            'Require KYC Verification',
            'Users must verify identity before bidding.'
          ),
          help: 'Users must verify identity before bidding.',
          checked: settings.wpam_require_kyc == 1, // allow both int 1 and string "1"
          onChange: (v) => updateField('wpam_require_kyc', v ? 1 : 0),
        })
      );
    }

    function renderAuctions() {
      return createElement(
        'div',
        null,
        createElement(SelectControl, {
          label: 'Default Auction Type',
          value: settings.wpam_default_auction_type || 'standard',
          options: [
            { label: 'Standard', value: 'standard' },
            { label: 'Sealed', value: 'sealed' },
          ],
          onChange: (v) => updateField('wpam_default_auction_type', v),
        }),
        createElement(ToggleControl, {
          label: 'Enable Proxy Bidding',
          checked: !!settings.wpam_enable_proxy_bidding,
          onChange: (v) => updateField('wpam_enable_proxy_bidding', v ? 1 : 0),
        }),
        createElement(ToggleControl, {
          label: 'Enable Silent Bidding',
          checked: !!settings.wpam_enable_silent_bidding,
          onChange: (v) => updateField('wpam_enable_silent_bidding', v ? 1 : 0),
        }),
        createElement(TextControl, {
          label: 'Soft Close Minutes',
          help: 'Duration added when soft close triggers.',
          value: settings.wpam_soft_close || '',
          onChange: (v) => updateField('wpam_soft_close', v),
          error: errors.wpam_soft_close,
        }),
        createElement(TextControl, {
          label: 'Buyer Premium (%)',
          value: settings.wpam_buyer_premium || '',
          onChange: (v) => updateField('wpam_buyer_premium', v),
        }),
        createElement(TextControl, {
          label: 'Seller Fee (%)',
          value: settings.wpam_seller_fee || '',
          onChange: (v) => updateField('wpam_seller_fee', v),
        })
      );
    }

    function renderNotifications() {
      return createElement(
        'div',
        null,
        createElement(ToggleControl, {
          label: labelWithTip('Enable Email Notifications', 'Send emails via WordPress or SendGrid.'),
          help: 'Send emails via WordPress or SendGrid.',
          checked: !!settings.wpam_enable_email,
          onChange: (v) => updateField('wpam_enable_email', v ? 1 : 0),
        }),
        createElement(ToggleControl, {
          label: labelWithTip('Enable Twilio Notifications', 'Send SMS messages using Twilio.'),
          help: 'Send SMS messages using Twilio.',
          checked: !!settings.wpam_enable_twilio,
          onChange: (v) => updateField('wpam_enable_twilio', v ? 1 : 0),
        }),
        createElement(TextControl, {
          label: 'Twilio SID',
          help: 'Your Twilio account SID.',
          value: settings.wpam_twilio_sid || '',
          onChange: (v) => updateField('wpam_twilio_sid', v),
          error: errors.wpam_twilio_sid,
        }),
        createElement(TextControl, {
          label: 'Twilio Token',
          help: 'Your Twilio auth token.',
          value: settings.wpam_twilio_token || '',
          onChange: (v) => updateField('wpam_twilio_token', v),
          error: errors.wpam_twilio_token,
        }),
        createElement(TextControl, {
          label: 'Twilio From Number',
          help: 'Phone number SMS will be sent from.',
          value: settings.wpam_twilio_from || '',
          onChange: (v) => updateField('wpam_twilio_from', v),
          error: errors.wpam_twilio_from,
        }),
        createElement(TextControl, {
          label: 'SendGrid API Key',
          help: 'Used for sending email notifications.',
          value: settings.wpam_sendgrid_key || '',
          onChange: (v) => updateField('wpam_sendgrid_key', v),
          error: errors.wpam_sendgrid_key,
        }),
        createElement(ToggleControl, {
          label: labelWithTip(
            'Enable Firebase',
            'Push notifications via Firebase Cloud Messaging.'
          ),
          help: 'Push notifications via Firebase Cloud Messaging.',
          checked: !!settings.wpam_enable_firebase,
          onChange: (v) => updateField('wpam_enable_firebase', v ? 1 : 0),
        }),
        createElement(TextControl, {
          label: 'Firebase Server Key',
          help: 'Server key from your Firebase project.',
          value: settings.wpam_firebase_server_key || '',
          onChange: (v) => updateField('wpam_firebase_server_key', v),
          error: errors.wpam_firebase_server_key,
        }),
        createElement(TextControl, {
          label: 'Webhook URL',
          help: 'POST requests will be sent here on auction events.',
          value: settings.wpam_webhook_url || '',
          onChange: (v) => updateField('wpam_webhook_url', v),
          error: errors.wpam_webhook_url,
        })
      );
    }

    function renderRealtime() {
      return createElement(
        'div',
        null,
        createElement(SelectControl, {
          label: 'Realtime Provider',
          help: 'Service used for realtime updates.',
          value: settings.wpam_realtime_provider || 'none',
          options: [
            { label: 'None', value: 'none' },
            { label: 'Pusher', value: 'pusher' },
          ],
          onChange: (v) => updateField('wpam_realtime_provider', v),
        }),
        createElement(TextControl, {
          label: 'Pusher App ID',
          help: 'Required when using Pusher.',
          value: settings.wpam_pusher_app_id || '',
          onChange: (v) => updateField('wpam_pusher_app_id', v),
          error: errors.wpam_pusher_app_id,
        }),
        createElement(TextControl, {
          label: 'Pusher Key',
          help: 'Required when using Pusher.',
          value: settings.wpam_pusher_key || '',
          onChange: (v) => updateField('wpam_pusher_key', v),
          error: errors.wpam_pusher_key,
        }),
        createElement(TextControl, {
          label: 'Pusher Secret',
          help: 'Required when using Pusher.',
          value: settings.wpam_pusher_secret || '',
          onChange: (v) => updateField('wpam_pusher_secret', v),
          error: errors.wpam_pusher_secret,
        }),
        createElement(TextControl, {
          label: 'Pusher Cluster',
          help: 'Required when using Pusher.',
          value: settings.wpam_pusher_cluster || '',
          onChange: (v) => updateField('wpam_pusher_cluster', v),
          error: errors.wpam_pusher_cluster,
        })
      );
    }

    return createElement(
      'div',
      null,
      notice &&
        createElement(
          Notice,
          {
            status: Object.keys(errors).length ? 'error' : 'success',
            isDismissible: false,
          },
          notice
        ),
      createElement(
        TabPanel,
        {
          className: 'wpam-settings-tabs',
          tabs: [
            { name: 'general', title: 'General' },
            { name: 'auctions', title: 'Auctions' },
            { name: 'notifications', title: 'Notifications' },
            { name: 'realtime', title: 'Realtime' },
          ],
        },
        (tab) => {
          if (tab.name === 'general') {
            return renderGeneral();
          }
          if (tab.name === 'auctions') {
            return renderAuctions();
          }
          if (tab.name === 'notifications') {
            return renderNotifications();
          }
          if (tab.name === 'realtime') {
            return renderRealtime();
          }
          return null;
        }
      ),
      createElement(
        Button,
        { isPrimary: true, isBusy: saving, onClick: saveSettings },
        saving ? 'Saving...' : 'Save Settings'
      )
    );
  }

  function init() {
    const root = document.getElementById('wpam-settings-root');
    if (root) {
      render(createElement(SettingsApp), root);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})(window.wp);
