import { useForm } from 'react-hook-form';
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

export default function GeneralForm() {
	const form = useForm({
		mode: 'onChange',
		defaultValues: {
			username: '',
		},
	});

	const onSubmit = (data) => {
		console.log('Form Data:', data);
	};

	return (
		<Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="tw-space-y-8">
				<FormField
					control={form.control}
					name="username"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Username</FormLabel>
							<FormControl>
								<Input placeholder="shadcn" {...field} />
							</FormControl>
							<FormDescription>
								This is your public display name. It can be your
								real name or a pseudonym. You can only change
								this once every 30 days.
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
