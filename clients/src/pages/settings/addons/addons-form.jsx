'use client';

import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import {
	Form,
	FormField,
	FormItem,
	FormLabel,
	FormControl,
	FormDescription,
	FormMessage,
} from '@/components/ui/form';

import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from '@/components/ui/collapsible';

const formSchema = z.object({
	enable_twilio: z.boolean(),
	twilio_sid: z.string().optional(),
	twilio_token: z.string().optional(),
	twilio_from: z.string().optional(),
	lead_sms_alerts: z.boolean(),

	enable_email: z.boolean(),
	sendgrid_key: z.string().optional(),

	enable_firebase: z.boolean(),
	firebase_server_key: z.string().optional(),

	realtime_provider: z.enum(['pusher', 'firebase']),
	pusher_app_id: z.string().optional(),
	pusher_key: z.string().optional(),
	pusher_secret: z.string().optional(),
	pusher_cluster: z.string().optional(),
});

export default function AddonsForm() {
	const form = useForm({
		resolver: zodResolver(formSchema),
		defaultValues: {
			enable_twilio: false,
			twilio_sid: '',
			twilio_token: '',
			twilio_from: '',
			lead_sms_alerts: false,

			enable_email: false,
			sendgrid_key: '',

			enable_firebase: false,
			firebase_server_key: '',

			realtime_provider: 'pusher',
			pusher_app_id: '',
			pusher_key: '',
			pusher_secret: '',
			pusher_cluster: '',
		},
	});

	const watchTwilio = useWatch({
		control: form.control,
		name: 'enable_twilio',
	});
	const watchEmail = useWatch({
		control: form.control,
		name: 'enable_email',
	});
	const watchFirebase = useWatch({
		control: form.control,
		name: 'enable_firebase',
	});

	const onSubmit = (data) => {
		console.log('Submitted Addons:', data);
	};

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
				{/* TWILIO */}
				<Collapsible open={watchTwilio}>
					<div className="border rounded-lg shadow-sm p-4 space-y-4">
						<div className="flex items-center justify-between">
							<h3 className="text-base font-medium">
								Twilio Integration
							</h3>
							<FormField
								control={form.control}
								name="enable_twilio"
								render={({ field }) => (
									<FormItem className="flex items-center gap-2">
										<FormLabel>Enable</FormLabel>
										<FormControl>
											<Switch
												checked={field.value}
												onCheckedChange={field.onChange}
											/>
										</FormControl>
									</FormItem>
								)}
							/>
						</div>

						<CollapsibleContent className="space-y-4 mt-4">
							<FormField
								control={form.control}
								name="twilio_sid"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Twilio SID</FormLabel>
										<FormControl>
											<Input
												placeholder="Your Twilio SID"
												{...field}
											/>
										</FormControl>
										<FormDescription>
											Account SID from Twilio Console.
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="twilio_token"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Twilio Token</FormLabel>
										<FormControl>
											<Input
												placeholder="Auth Token"
												type="password"
												{...field}
											/>
										</FormControl>
										<FormDescription>
											Your Twilio auth token.
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="twilio_from"
								render={({ field }) => (
									<FormItem>
										<FormLabel>
											Twilio From Number
										</FormLabel>
										<FormControl>
											<Input
												placeholder="+1234567890"
												{...field}
											/>
										</FormControl>
										<FormDescription>
											Sender number for SMS.
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="lead_sms_alerts"
								render={({ field }) => (
									<FormItem className="flex items-center justify-between">
										<FormLabel>
											Enable Bid SMS Alerts
										</FormLabel>
										<FormControl>
											<Switch
												checked={field.value}
												onCheckedChange={field.onChange}
											/>
										</FormControl>
									</FormItem>
								)}
							/>
						</CollapsibleContent>
					</div>
				</Collapsible>

				{/* SENDGRID EMAIL */}
				<Collapsible open={watchEmail}>
					<div className="border rounded-lg shadow-sm p-4 space-y-4">
						<div className="flex items-center justify-between">
							<h3 className="text-base font-medium">
								Email Integration (SendGrid)
							</h3>
							<FormField
								control={form.control}
								name="enable_email"
								render={({ field }) => (
									<FormItem className="flex items-center gap-2">
										<FormLabel>Enable</FormLabel>
										<FormControl>
											<Switch
												checked={field.value}
												onCheckedChange={field.onChange}
											/>
										</FormControl>
									</FormItem>
								)}
							/>
						</div>

						<CollapsibleContent className="space-y-4 mt-4">
							<FormField
								control={form.control}
								name="sendgrid_key"
								render={({ field }) => (
									<FormItem>
										<FormLabel>SendGrid API Key</FormLabel>
										<FormControl>
											<Input
												placeholder="SG.XXXX..."
												type="password"
												{...field}
											/>
										</FormControl>
										<FormDescription>
											Your SendGrid API key for sending
											emails.
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>
						</CollapsibleContent>
					</div>
				</Collapsible>

				{/* FIREBASE */}
				<Collapsible open={watchFirebase}>
					<div className="border rounded-lg shadow-sm p-4 space-y-4">
						<div className="flex items-center justify-between">
							<h3 className="text-base font-medium">
								Firebase Integration
							</h3>
							<FormField
								control={form.control}
								name="enable_firebase"
								render={({ field }) => (
									<FormItem className="flex items-center gap-2">
										<FormLabel>Enable</FormLabel>
										<FormControl>
											<Switch
												checked={field.value}
												onCheckedChange={field.onChange}
											/>
										</FormControl>
									</FormItem>
								)}
							/>
						</div>

						<CollapsibleContent className="space-y-4 mt-4">
							<FormField
								control={form.control}
								name="firebase_server_key"
								render={({ field }) => (
									<FormItem>
										<FormLabel>
											Firebase Server Key
										</FormLabel>
										<FormControl>
											<Input
												placeholder="AAAA..."
												type="password"
												{...field}
											/>
										</FormControl>
										<FormDescription>
											Firebase Cloud Messaging server key.
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>
						</CollapsibleContent>
					</div>
				</Collapsible>

				{/* REALTIME PROVIDER - ALWAYS VISIBLE */}
				<div className="border rounded-lg shadow-sm p-4 space-y-4">
					<h3 className="text-base font-medium">
						Realtime Provider (Pusher)
					</h3>
					<FormField
						control={form.control}
						name="pusher_app_id"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Pusher App ID</FormLabel>
								<FormControl>
									<Input placeholder="App ID" {...field} />
								</FormControl>
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="pusher_key"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Pusher Key</FormLabel>
								<FormControl>
									<Input placeholder="Key" {...field} />
								</FormControl>
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="pusher_secret"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Pusher Secret</FormLabel>
								<FormControl>
									<Input
										placeholder="Secret"
										type="password"
										{...field}
									/>
								</FormControl>
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="pusher_cluster"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Pusher Cluster</FormLabel>
								<FormControl>
									<Input placeholder="e.g., us2" {...field} />
								</FormControl>
							</FormItem>
						)}
					/>
				</div>

				<Button type="submit">Save Settings</Button>
			</form>
		</Form>
	);
}
