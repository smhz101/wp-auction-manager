import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const schema = z.object({
	wpam_default_increment: z.coerce
		.number()
		.min(0, 'Default increment must be at least 0'),
	wpam_soft_close_threshold: z.coerce
		.number()
		.min(0, 'Threshold must be at least 0'),
	wpam_soft_close_extend: z.coerce
		.number()
		.min(0, 'Extension must be at least 0'),
	wpam_max_extensions: z.coerce
		.number()
		.min(0, 'Max extensions must be at least 0'),
});

export default function AuctionForm() {
	const form = useForm({
		resolver: zodResolver(schema),
		mode: 'onChange',
		defaultValues: {
			wpam_default_increment: 0,
			wpam_soft_close_threshold: 0,
			wpam_soft_close_extend: 0,
			wpam_max_extensions: 0,
		},
	});

	useEffect(() => {
		fetch('/wp-json/wpam/v1/settings')
			.then((res) => res.json())
			.then((data) => {
				form.reset({
					wpam_default_increment: Number(
						data.wpam_default_increment ?? 0
					),
					wpam_soft_close_threshold: Number(
						data.wpam_soft_close_threshold ?? 0
					),
					wpam_soft_close_extend: Number(
						data.wpam_soft_close_extend ?? 0
					),
					wpam_max_extensions: Number(data.wpam_max_extensions ?? 0),
				});
			})
			.catch(() => {});
	}, [form]);

	const onSubmit = async (values) => {
		const nonce =
			window?.wpApiSettings?.nonce || window?.wpamSettings?.nonce;
		const res = await fetch('/wp-json/wpam/v1/settings', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				...(nonce ? { 'X-WP-Nonce': nonce } : {}),
			},
			body: JSON.stringify(values),
		});

		if (res.ok) {
			toast.success('Settings saved');
		} else {
			toast.error('Failed to save settings');
		}
	};

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
				<FormField
					control={form.control}
					name="wpam_default_increment"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Default Increment</FormLabel>
							<FormControl>
								<Input type="number" step="0.01" {...field} />
							</FormControl>
							<FormDescription>
								Base bid increment for new auctions.
							</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="wpam_soft_close_threshold"
					render={({ field }) => (
						<FormItem>
							<FormLabel>
								Soft Close Threshold (seconds)
							</FormLabel>
							<FormControl>
								<Input type="number" {...field} />
							</FormControl>
							<FormDescription>
								Time before auction end when soft close
								activates.
							</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="wpam_soft_close_extend"
					render={({ field }) => (
						<FormItem>
							<FormLabel>
								Soft Close Extension (seconds)
							</FormLabel>
							<FormControl>
								<Input type="number" {...field} />
							</FormControl>
							<FormDescription>
								How long to extend the auction when soft close
								triggers.
							</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="wpam_max_extensions"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Max Extensions</FormLabel>
							<FormControl>
								<Input type="number" {...field} />
							</FormControl>
							<FormDescription>
								Maximum number of soft close extensions (0 for
								unlimited).
							</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>

				<Button type="submit">Save</Button>
			</form>
		</Form>
	);
}
