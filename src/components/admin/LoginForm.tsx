import { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { signIn } from '@/lib/api/auth';
import { loginSchema, type LoginFormData, type LoginFormInput } from '@/lib/schemas/loginSchema';

const usernameLabel = 'Usuário';
const passwordLabel = 'Senha';
const submitLabel = 'Entrar';
const submittingLabel = 'Entrando...';
const invalidCredentialsMessage = 'Usuário ou senha incorretos.';
const signInErrorMessage = 'Não deu pra entrar agora. Tente de novo.';

const emptyForm: LoginFormInput = {
  username: '',
  password: '',
};

function LoginFields() {
  return (
    <div className="flex flex-col gap-4">
      <FormField<LoginFormData>
        name="username"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{usernameLabel}</FormLabel>
            <FormControl>
              <Input {...field} autoComplete="username" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField<LoginFormData>
        name="password"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{passwordLabel}</FormLabel>
            <FormControl>
              <Input {...field} type="password" autoComplete="current-password" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

export function LoginForm() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<LoginFormInput, unknown, LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: emptyForm,
  });

  const sendCredentials = useCallback(
    async (data: LoginFormData) => {
      setIsSubmitting(true);
      const result = await signIn(data);
      setIsSubmitting(false);

      if (result.ok) {
        void navigate('/admin', { replace: true });
        return;
      }

      toast.error(
        result.reason === 'invalid_credentials' ? invalidCredentialsMessage : signInErrorMessage,
      );
    },
    [navigate],
  );

  const submitCredentials = useCallback(
    (data: LoginFormData) => {
      void sendCredentials(data);
    },
    [sendCredentials],
  );

  return (
    <Form {...form}>
      <form
        onSubmit={(event) => {
          void form.handleSubmit(submitCredentials)(event);
        }}
        className="flex flex-col gap-6"
      >
        <LoginFields />
        <Button type="submit" disabled={isSubmitting} aria-busy={isSubmitting} className="w-full">
          {isSubmitting ? submittingLabel : submitLabel}
        </Button>
      </form>
    </Form>
  );
}
