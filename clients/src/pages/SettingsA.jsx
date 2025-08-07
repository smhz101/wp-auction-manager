import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Toggle } from '@/components/ui/toggle';
import { Select } from '@/components/ui/select';
import Toast from '@/components/ui/toast';

const endpoint = window.wpamData.settings_endpoint;
const nonce = window.wpamData.nonce;

const selectOptions = {
  wpam_realtime_provider: [
    { value: 'none', label: 'None' },
    { value: 'pusher', label: 'Pusher' },
  ],
  wpam_default_auction_type: [
    { value: 'standard', label: 'Standard' },
    { value: 'sealed', label: 'Sealed' },
    { value: 'reverse', label: 'Reverse' },
  ],
};

const toggleFields = [
  'wpam_enable_twilio',
  'wpam_lead_sms_alerts',
  'wpam_enable_firebase',
  'wpam_enable_email',
  'wpam_require_kyc',
  'wpam_enable_proxy_bidding',
  'wpam_enable_silent_bidding',
  'wpam_enable_toasts',
];

export default function Settings() {
  const [options, setOptions] = useState(null);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({
    open: false,
    type: 'success',
    message: '',
  });

  useEffect(() => {
    axios
      .get(endpoint, { headers: { 'X-WP-Nonce': nonce } })
      .then((res) => setOptions(res.data))
      .catch(() =>
        setToast({
          open: true,
          type: 'error',
          message: 'Failed to load settings.',
        })
      );
  }, []);

  useEffect(() => {
    if (options) setErrors(validateRequired(options));
  }, [options]);

  function updateField(key, value) {
    setOptions((prev) => ({ ...prev, [key]: value }));
  }

  function validateRequired(opts) {
    const newErrors = {};
    if (opts.wpam_enable_twilio) {
      if (!opts.wpam_twilio_sid)
        newErrors.wpam_twilio_sid = 'Required when Twilio is enabled.';
      if (!opts.wpam_twilio_token)
        newErrors.wpam_twilio_token = 'Required when Twilio is enabled.';
      if (!opts.wpam_twilio_from)
        newErrors.wpam_twilio_from = 'Required when Twilio is enabled.';
    }
    if (opts.wpam_enable_firebase) {
      if (!opts.wpam_firebase_server_key)
        newErrors.wpam_firebase_server_key =
          'Server key required when Firebase is enabled.';
    }
    if (opts.wpam_realtime_provider === 'pusher') {
      if (!opts.wpam_pusher_app_id)
        newErrors.wpam_pusher_app_id = 'Required when using Pusher.';
      if (!opts.wpam_pusher_key)
        newErrors.wpam_pusher_key = 'Required when using Pusher.';
      if (!opts.wpam_pusher_secret)
        newErrors.wpam_pusher_secret = 'Required when using Pusher.';
      if (!opts.wpam_pusher_cluster)
        newErrors.wpam_pusher_cluster = 'Required when using Pusher.';
    }
    return newErrors;
  }

  function save() {
    const warns = {};
    const warnIfInvalid = (key, value, test, message) => {
      if (value !== '' && !test(value)) warns[key] = message;
    };
    warnIfInvalid(
      'wpam_default_increment',
      parseFloat(options.wpam_default_increment),
      (v) => v > 0,
      'Should be a positive number.'
    );
    warnIfInvalid(
      'wpam_soft_close',
      parseInt(options.wpam_soft_close, 10),
      (v) => v >= 0,
      'Should be zero or more.'
    );
    warnIfInvalid(
      'wpam_buyer_premium',
      parseFloat(options.wpam_buyer_premium),
      (v) => v >= 0,
      'Should be zero or more.'
    );
    warnIfInvalid(
      'wpam_seller_fee',
      parseFloat(options.wpam_seller_fee),
      (v) => v >= 0,
      'Should be zero or more.'
    );
    warnIfInvalid(
      'wpam_soft_close_threshold',
      parseInt(options.wpam_soft_close_threshold, 10),
      (v) => v >= 0,
      'Should be zero or more.'
    );
    warnIfInvalid(
      'wpam_soft_close_extend',
      parseInt(options.wpam_soft_close_extend, 10),
      (v) => v > 0,
      'Should be a positive number.'
    );
    warnIfInvalid(
      'wpam_max_extensions',
      parseInt(options.wpam_max_extensions, 10),
      (v) => v >= 0,
      'Should be zero or more.'
    );
    const requiredErrors = validateRequired(options);
    setErrors({ ...requiredErrors, ...warns });
    setSaving(true);
    axios
      .post(endpoint, options, { headers: { 'X-WP-Nonce': nonce } })
      .then((res) => {
        setOptions(res.data);
        setToast({ open: true, type: 'success', message: 'Settings saved.' });
        setSaving(false);
      })
      .catch((error) => {
        const params = error.response?.data?.params;
        if (params) {
          setErrors((prev) => ({ ...prev, ...params }));
        }
        const summary =
          error.response?.data?.message ||
          'Failed to save settings. Please review the highlighted fields.';
        setToast({
          open: true,
          type: 'error',
          message: summary,
        });
        setSaving(false);
      });
  }

  if (!options) {
    return <p>Loading...</p>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Settings</CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        {Object.entries(options).map(([key, val]) => {
          if (selectOptions[key]) {
            return (
              <div key={key} className='space-y-1'>
                <label className='font-medium capitalize'>
                  {key.replace(/_/g, ' ')}
                </label>
                <Select
                  value={val ?? ''}
                  onChange={(v) => updateField(key, v)}
                  options={selectOptions[key]}
                />
                {errors[key] && (
                  <p className='text-destructive text-sm'>{errors[key]}</p>
                )}
              </div>
            );
          }
          if (toggleFields.includes(key)) {
            const boolVal = !!val;
            return (
              <div key={key} className='flex items-center gap-2'>
                <label className='capitalize'>{key.replace(/_/g, ' ')}</label>
                <Toggle
                  checked={boolVal}
                  onCheckedChange={(v) => updateField(key, v)}
                />
                {errors[key] && (
                  <p className='text-destructive text-sm'>{errors[key]}</p>
                )}
              </div>
            );
          }
          return (
            <div key={key} className='space-y-1'>
              <label className='font-medium capitalize'>
                {key.replace(/_/g, ' ')}
              </label>
              <Input
                value={val ?? ''}
                onChange={(e) => updateField(key, e.target.value)}
                type='text'
              />
              {errors[key] && (
                <p className='text-destructive text-sm'>{errors[key]}</p>
              )}
            </div>
          );
        })}
      </CardContent>
      <CardFooter>
        <Button onClick={save} disabled={saving}>
          {saving ? 'Saving...' : 'Save'}
        </Button>
      </CardFooter>
      <Toast
        open={toast.open}
        type={toast.type}
        message={toast.message}
        onOpenChange={(o) => setToast({ ...toast, open: o })}
      />
    </Card>
  );
}
