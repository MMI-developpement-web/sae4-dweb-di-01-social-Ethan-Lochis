import { useReducer, useState } from "react";
import Button from "./ui/Button";
import FormField from "./ui/FormField";
import { cn } from "../lib/utils";

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
  if (!fields.password) errors.password = "Ce champ est requis.";
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

// ─── Composant principal ──────────────────────────────────────────────────────

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [state, dispatch] = useReducer(formReducer, initialState);
  const { username, email, password, errors } = state;

  function handleTabSwitch(login: boolean) {
    setIsLogin(login);
    dispatch({ type: "RESET" });
  }

  function handleField(field: "username" | "email" | "password") {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      dispatch({ type: "SET_FIELD", field, value: e.target.value });
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const newErrors = validate({ username, email, password }, isLogin);
    if (Object.keys(newErrors).length > 0) {
      dispatch({ type: "SET_ERRORS", errors: newErrors });
      return;
    }
    dispatch({ type: "SET_ERRORS", errors: {} });
    // TODO: appel API
  }

  return (
    <>
      <h1 className="text-secondary text-4xl font-bold">Kontakt</h1>
      <h2 className="text-fg text-3xl">
        {isLogin ? "Connectez-vous" : "Inscrivez-vous"}
      </h2>
      <div className="bg-bg-lighter flex w-full max-w-sm flex-col gap-6 rounded-lg p-8 shadow-2xl">
        <AuthTabs isLogin={isLogin} onSwitch={handleTabSwitch} />

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
            required
          />
          <Button>{isLogin ? "Se connecter" : "Créer un compte"}</Button>
        </form>
      </div>
    </>
  );
}
