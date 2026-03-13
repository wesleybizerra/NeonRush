import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'pt',
    interpolation: {
      escapeValue: false,
    },
    resources: {
      pt: {
        translation: {
          "home": "Início",
          "garage": "Garagem",
          "plans": "Planos",
          "profile": "Perfil",
          "logout": "Sair",
          "login": "Entrar",
          "register": "Criar Conta",
          "basic_plan": "Plano Básico",
          "pro_plan": "Plano Profissional",
          "extreme_plan": "Plano Extremo",
          "subscribe": "Assinar"
        }
      },
      en: {
        translation: {
          "home": "Home",
          "garage": "Garage",
          "plans": "Plans",
          "profile": "Profile",
          "logout": "Logout",
          "login": "Login",
          "register": "Register",
          "basic_plan": "Basic Plan",
          "pro_plan": "Pro Plan",
          "extreme_plan": "Extreme Plan",
          "subscribe": "Subscribe"
        }
      }
    }
  });

export default i18n;
