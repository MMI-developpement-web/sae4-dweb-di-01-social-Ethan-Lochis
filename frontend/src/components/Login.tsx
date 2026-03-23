import { useReducer, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "./ui/Button";
import FormField from "./ui/FormField";
import { IconSpinner } from "./ui/Icons";
import { cn } from "../lib/utils";
import { apiFetch } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";

// ─── Types ────────────────────────────────────────────────────────────────────

interface LoginErrors {
  username?: string;
  email?: string;
  password?: string;
}

interface FormState {
  username: string;
  email: string;
  password: string;
  errors: LoginErrors;
}

type FormAction =
  | {
      type: "SET_FIELD";
      field: "username" | "email" | "password";
      value: string;
    }
  | { type: "SET_ERRORS"; errors: LoginErrors }
  | { type: "RESET" };

// ─── État initial ─────────────────────────────────────────────────────────────

const initialState: FormState = {
  username: "",
  email: "",
  password: "",
  errors: {},
};

// ─── Reducer ──────────────────────────────────────────────────────────────────

function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    // Changement des fields , on met a jour l'affichage
    case "SET_FIELD":
      return { ...state, [action.field]: action.value };
      // Mise à jour des erreurs (après validation)
    case "SET_ERRORS":
      return { ...state, errors: action.errors };
      // Changement d'onglet : on réinitialise le formulaire
    case "RESET":
      return initialState;
    default:
      return state;
  }
}

// ─── Validation (fonction pure, hors composant) ───────────────────────────────

function validate(
  fields: Pick<FormState, "username" | "email" | "password">,
  isLogin: boolean,
): LoginErrors {
  const errors: LoginErrors = {};
  if (!fields.username.trim()) errors.username = "Ce champ est requis.";
  if (!isLogin && !fields.email.trim()) {
    errors.email = "Ce champ est requis.";
  } else if (!isLogin && !fields.email.includes("@")) {
    errors.email = "L'adresse e-mail doit contenir un @.";
  }
  if (!fields.password) {
    errors.password = "Ce champ est requis.";
  } else if (!isLogin) {
    // 8 car. min, 1 Majuscule, 1 Minuscule, 1 chiffre, 1 caractère spécial
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    if (!passwordRegex.test(fields.password)) {
      errors.password = "Critères de sécurité non respectés.";
    }
  }
  return errors;
}

// ─── Sous-composant onglets ───────────────────────────────────────────────────

interface AuthTabsProps {
  isLogin: boolean;
  onSwitch: (login: boolean) => void;
}

function AuthTabs({ isLogin, onSwitch }: AuthTabsProps) {
  const tabClass = (active: boolean) =>
    cn(
      "flex-1 rounded-md py-2 text-sm font-medium transition-all",
      active ? "bg-primary text-fg shadow-sm" : "text-fg/40 hover:text-fg",
    );

  return (
    <div className="bg-fg/10 flex rounded-lg p-1">
      <button
        type="button"
        onClick={() => onSwitch(true)}
        className={tabClass(isLogin)}
      >
        Connexion
      </button>
      <button
        type="button"
        onClick={() => onSwitch(false)}
        className={tabClass(!isLogin)}
      >
        Inscription
      </button>
    </div>
  );
}

// ─── Barre de force du mot de passe ───────────────────────────────────────────

function PasswordStrengthBar({ password }: { password?: string }) {
  if (!password) return null;
  
  let score = 0;
  if (password.length >= 8) score++;
  if (/(?=.*[a-z])/.test(password) && /(?=.*[A-Z])/.test(password)) score++;
  if (/(?=.*\d)/.test(password)) score++;
  if (/(?=.*[\W_])/.test(password)) score++;

  let colorClass = "bg-red-500";
  let widthClass = "w-1/4";

  if (score === 2) {
    colorClass = "bg-orange-500";
    widthClass = "w-2/4";
  } else if (score === 3) {
    colorClass = "bg-yellow-500";
    widthClass = "w-3/4";
  } else if (score === 4) {
    colorClass = "bg-green-500";
    widthClass = "w-full";
  }

  return (
    <div className="-mt-2 mb-2 flex flex-col gap-1.5 px-1">
      <div className="h-1.5 w-full bg-fg/10 rounded-full overflow-hidden">
        <div className={cn("h-full transition-all duration-300", colorClass, widthClass)} />
      </div>
      <span className="text-xs text-fg/60">
        {score < 4 
          ? "Requis : 8+ car, 1 maj, 1 min, 1 chiffre, 1 spécial." 
          : "Mot de passe fort et valide"}
      </span>
    </div>
  );
}

// ─── Composant principal ──────────────────────────────────────────────────────

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [state, dispatch] = useReducer(formReducer, initialState);
  const { username, email, password, errors } = state;
  const navigate = useNavigate();
  const { login } = useAuth();
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleTabSwitch(login: boolean) {
    setIsLogin(login);
    dispatch({ type: "RESET" });
    setApiError(null);
  }

  function handleField(field: "username" | "email" | "password") {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      dispatch({ type: "SET_FIELD", field, value: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setApiError(null);
    const newErrors = validate({ username, email, password }, isLogin);
    if (Object.keys(newErrors).length > 0) {
      dispatch({ type: "SET_ERRORS", errors: newErrors });
      return;
    }
    dispatch({ type: "SET_ERRORS", errors: {} });
    setIsSubmitting(true);
    
    try {
      if (isLogin) {
        // Login API Call
        const response = await apiFetch<{ token: string, user: any }>('/login', {
          method: 'POST',
          body: JSON.stringify({ username, password })
        });
        login(response.token, response.user);
        navigate('/');
      } else {
        // Register API Call
        await apiFetch('/users', {
          method: 'POST',
          body: JSON.stringify({ username, email, password })
        });
        
        // After successfull register, we can automatically log in
        const response = await apiFetch<{ token: string, user: any }>('/login', {
          method: 'POST',
          body: JSON.stringify({ username, password })
        });
        
        login(response.token, response.user);
        navigate('/');
      }
    } catch (err: any) {
      setApiError(err.message || 'Une erreur est survenue.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <img src="../Logo.png" alt="Logo de KONTAKT" className="w-2/3 my-22"/>
      <h2 className="text-fg text-3xl">
        {isLogin ? "Connectez-vous" : "Inscrivez-vous"}
      </h2>
      <div className="bg-bg-lighter flex w-full max-w-sm flex-col gap-6 rounded-lg p-8 shadow-2xl">
        <AuthTabs isLogin={isLogin} onSwitch={handleTabSwitch} />

        {apiError && (
          <div className="p-3 bg-red-500/10 border border-red-500 text-red-500 rounded text-sm text-center">
            {apiError}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          noValidate
          className="flex flex-col gap-4"
        >
          <FormField
            id="username"
            label="Nom d'utilisateur"
            variant="username"
            value={username}
            onChange={handleField("username")}
            error={errors.username}
            required
          />
          {!isLogin && (
            <FormField
              id="email"
              label="Adresse e-mail"
              variant="email"
              value={email}
              onChange={handleField("email")}
              error={errors.email}
              required
            />
          )}
          <FormField
            id="password"
            label="Mot de passe"
            variant="password"
            value={password}
            onChange={handleField("password")}
            error={errors.password}
            disabled={isSubmitting}
            required
          />
          {!isLogin && <PasswordStrengthBar password={password} />}
          <Button disabled={isSubmitting}>
            {isSubmitting ? (
              <span className="inline-flex items-center gap-2">
                <span className="text-fg [&>svg]:size-4">
                  <IconSpinner />
                </span>
                {isLogin ? "Connexion..." : "Création..."}
              </span>
            ) : (
              isLogin ? "Se connecter" : "Créer un compte"
            )}
          </Button>
        </form>
      </div>
    </>
  );
}
