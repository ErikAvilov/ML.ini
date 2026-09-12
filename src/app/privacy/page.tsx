import type { Metadata } from "next";
import Link from "next/link";
import {
  LegalContactBlock,
  LegalDocument,
  LegalSection,
} from "@/components/legal/LegalDocument";
import {
  LEGAL_OPERATOR,
  LEGAL_PATHS,
  LEGAL_URLS,
} from "@/data/legal/constants";

export const metadata: Metadata = {
  title: "Politique de confidentialité | MLINI",
  description: "Politique de confidentialité de MLINI.",
  alternates: { canonical: LEGAL_URLS.privacy },
};

export default function PrivacyPage() {
  return (
    <LegalDocument title="Politique de confidentialité">
      <LegalSection id="introduction" title="1. Introduction">
        <p>
          La présente politique décrit comment les données personnelles sont
          traitées lorsque vous utilisez {LEGAL_OPERATOR.productName} et, le
          cas échéant, lorsque vous créez un compte {LEGAL_OPERATOR.productName}.
        </p>
        <p>
          Le Royaume I peut actuellement être exploré sans créer de compte.
          L’ouverture d’un compte est optionnelle pour accéder à cette partie
          du service.
        </p>
        <p>
          Responsable du traitement : {LEGAL_OPERATOR.operatorName},{" "}
          {LEGAL_OPERATOR.status} (SIREN {LEGAL_OPERATOR.siren}).
        </p>
        <p>
          Contact :{" "}
          <a
            className="text-ml-accent underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ml-accent"
            href={`mailto:${LEGAL_OPERATOR.email}`}
          >
            {LEGAL_OPERATOR.email}
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection id="categories" title="2. Catégories de données">
        <h3 className="pt-1 text-[length:var(--ml-text-base)] font-semibold text-ml-text">
          Données d’authentification
        </h3>
        <p>
          Si vous créez un compte via Google ou GitHub, {LEGAL_OPERATOR.productName}{" "}
          peut recevoir les informations nécessaires à l’authentification,
          notamment : identifiant fourni par le prestataire, adresse e-mail,
          nom d’affichage, image de profil/avatar, et informations de
          session/authentification.
        </p>
        <p>
          {LEGAL_OPERATOR.productName} ne reçoit pas votre mot de passe Google
          ou GitHub. L’adresse e-mail n’est pas affichée publiquement sur
          {LEGAL_OPERATOR.productName}.
        </p>

        <h3 className="pt-2 text-[length:var(--ml-text-base)] font-semibold text-ml-text">
          Données de profil
        </h3>
        <p>
          Pour un compte authentifié : identifiant de compte, pseudo{" "}
          {LEGAL_OPERATOR.productName} unique (choisi lors de l’onboarding),
          nom d’affichage et URL d’avatar le cas échéant.
        </p>

        <h3 className="pt-2 text-[length:var(--ml-text-base)] font-semibold text-ml-text">
          Données de progression
        </h3>
        <p>
          Lorsque la progression cloud est activée pour un compte connecté :{" "}
          missions terminées, XP, état de progression (notamment royaume/mission
          courants), horodatages ou métadonnées techniques associées aux
          complétions.
        </p>

        <h3 className="pt-2 text-[length:var(--ml-text-base)] font-semibold text-ml-text">
          Données anonymes / locales
        </h3>
        <p>
          Sans compte, la progression peut être conservée localement dans votre
          navigateur. Cette progression locale n’est pas automatiquement
          équivalente à un compte cloud : elle n’est pas importée vers le
          compte authentifié tant qu’une synchronisation dédiée n’a pas été
          mise en place.
        </p>

        <h3 className="pt-2 text-[length:var(--ml-text-base)] font-semibold text-ml-text">
          Données techniques
        </h3>
        <p>
          Comme pour la plupart des applications web, des données techniques
          liées aux requêtes (par exemple journaux d’infrastructure du
          prestataire d’hébergement) peuvent être traitées pour faire
          fonctionner et sécuriser le service.{" "}
          {LEGAL_OPERATOR.productName} n’utilise pas, à ce jour, d’outils
          d’analytics marketing ou de cookies publicitaires identifiés dans
          l’application.
        </p>
      </LegalSection>

      <LegalSection id="google" title="3. Données Google (OAuth)">
        <p>
          L’authentification Google sert uniquement à : authentifier
          l’utilisateur, établir le compte/session {LEGAL_OPERATOR.productName},
          et obtenir les informations de base nécessaires à l’initialisation du
          profil lorsque cela est autorisé.
        </p>
        <p>
          Dans l’implémentation actuelle, {LEGAL_OPERATOR.productName}{" "}
          démarre la connexion OAuth via Better Auth sans demander de scopes
          Google supplémentaires (pas d’accès revendiqué à Gmail, Drive,
          Agenda, Contacts, Photos ou documents hors le flux de connexion
          standard).
        </p>
        <p>
          Les données utilisateur issues de Google ne sont pas utilisées à des
          fins publicitaires. {LEGAL_OPERATOR.productName} ne vend pas les
          données personnelles des utilisateurs.
        </p>
      </LegalSection>

      <LegalSection id="github" title="4. GitHub (OAuth)">
        <p>
          GitHub est un prestataire d’authentification optionnel, utilisé de la
          même façon (établissement de session/compte et informations de base
          de profil autorisées).
        </p>
        <p>
          {LEGAL_OPERATOR.productName} ne revendique pas l’accès à vos dépôts,
          à votre code, à vos organisations ou à vos projets privés via des
          scopes étendus : la connexion repose sur le flux OAuth standard
          configuré avec Better Auth.
        </p>
      </LegalSection>

      <LegalSection id="gemini" title="5. Google Gemini (exercices IA)">
        <p>
          Certaines missions interactives utilisent Google Gemini (ou, selon
          configuration serveur, un fournisseur de secours) pour générer ou
          évaluer des réponses.
        </p>
        <p>
          Dans ces missions, le contenu nécessaire à l’exécution de l’exercice
          (par exemple une instruction rédigée par le joueur, un message de
          test, ou un objectif pour un indice) peut être transmis au fournisseur
          du modèle d’IA afin de produire une réponse.
        </p>
        <p>
          Nous vous recommandons de ne pas saisir d’informations personnelles
          ou sensibles inutiles dans les champs d’exercice.{" "}
          {LEGAL_OPERATOR.productName} ne garantit pas les politiques de
          conservation ou d’entraînement propres au fournisseur du modèle ;
          celles-ci relèvent des conditions du prestataire concerné.
        </p>
      </LegalSection>

      <LegalSection id="purposes" title="6. Finalités">
        <p>Les données sont traitées pour :</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>authentifier le compte et maintenir la session ;</li>
          <li>gérer le profil {LEGAL_OPERATOR.productName} ;</li>
          <li>
            enregistrer la progression cloud lorsque cette fonctionnalité est
            active ;
          </li>
          <li>faire fonctionner les exercices interactifs avec IA ;</li>
          <li>exploiter et sécuriser l’application ;</li>
          <li>prévenir les abus ;</li>
          <li>
            répondre aux demandes relatives au compte ou à la vie privée.
          </li>
        </ul>
        <p>
          {LEGAL_OPERATOR.productName} ne pratique pas de publicité ciblée, de
          profilage marketing ni de revente de données.
        </p>
      </LegalSection>

      <LegalSection id="bases" title="7. Bases légales">
        <p>
          Selon le cas : exécution du service demandé / mesures précontractuelles
          (compte, authentification, progression, fonctionnalités demandées) ;
          intérêt légitime (sécurité, prévention des abus, fiabilité) lorsque
          cela s’applique ; consentement uniquement lorsque{" "}
          {LEGAL_OPERATOR.productName} s’appuie réellement sur un consentement
          (ce n’est pas la base unique de tous les traitements).
        </p>
      </LegalSection>

      <LegalSection id="optional" title="8. Données optionnelles / nécessaires">
        <p>
          La création de compte est actuellement optionnelle pour accéder au
          Royaume I. Si vous choisissez de créer un compte, les informations
          requises par Google/GitHub et par le flux d’authentification de{" "}
          {LEGAL_OPERATOR.productName} sont nécessaires pour cette
          authentification. Un pseudo {LEGAL_OPERATOR.productName} est
          attribué automatiquement et peut être modifié dans le profil.
        </p>
      </LegalSection>

      <LegalSection id="cookies" title="9. Cookies et stockage local">
        <p>
          Authentification : des cookies de session nécessaires sont utilisés
          pour maintenir la connexion (Better Auth, côté application).
        </p>
        <p>
          Progression anonyme : {LEGAL_OPERATOR.productName} peut utiliser le
          stockage local du navigateur (localStorage) pour conserver la
          progression sur l’appareil actuel, ainsi que d’autres données
          techniques locales (par exemple brouillons de mission, préférence de
          langue, états temporaires de session liés aux exercices).
        </p>
        <p>
          Ces mécanismes ne sont pas présentés comme des cookies publicitaires.
          Aucune bannière de consentement marketing n’est affichée, faute de
          traçage non essentiel identifié dans l’application.
        </p>
      </LegalSection>

      <LegalSection id="processors" title="10. Prestataires techniques">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong className="text-ml-text">Vercel</strong> — hébergement et
            diffusion de l’application.
          </li>
          <li>
            <strong className="text-ml-text">Neon</strong> — base de données
            PostgreSQL (comptes, profils, progression cloud).
          </li>
          <li>
            <strong className="text-ml-text">Google</strong> — authentification
            OAuth optionnelle.
          </li>
          <li>
            <strong className="text-ml-text">GitHub</strong> — authentification
            OAuth optionnelle.
          </li>
          <li>
            <strong className="text-ml-text">Google Gemini</strong> —
            fonctionnalités d’IA des missions interactives (via appels serveur).
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="recipients" title="11. Destinataires">
        <p>
          Les informations personnelles peuvent être traitées par des
          prestataires techniques uniquement dans la mesure nécessaire à la
          fourniture de {LEGAL_OPERATOR.productName}.{" "}
          {LEGAL_OPERATOR.productName} ne vend pas les données personnelles des
          utilisateurs.
        </p>
      </LegalSection>

      <LegalSection id="transfers" title="12. Transferts internationaux">
        <p>
          Certains prestataires peuvent traiter des données hors de France ou
          de l’Espace économique européen. Des garanties applicables prévues
          par la réglementation et/ou par les conditions des prestataires
          peuvent s’appliquer.{" "}
          {LEGAL_OPERATOR.productName} ne promet pas une localisation
          géographique précise des données au-delà de ce qui résulte de
          l’architecture technique utilisée.
        </p>
      </LegalSection>

      <LegalSection id="retention" title="13. Conservation">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            Données de compte : pendant la durée d’activité du compte et le
            temps nécessaire à l’exploitation/sécurité du service ou aux
            obligations légales.
          </li>
          <li>
            Progression cloud : associée au compte jusqu’à suppression ou tant
            que nécessaire pour fournir le service.
          </li>
          <li>
            Progression anonyme locale : demeure sur l’appareil/navigateur
            jusqu’à effacement/réinitialisation par l’utilisateur.
          </li>
          <li>
            Enregistrements techniques/sécurité : aussi longtemps que
            nécessaire à leur finalité, selon les systèmes et prestataires
            concernés.
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="rights" title="14. Vos droits">
        <p>
          Lorsque le RGPD s’applique, vous pouvez disposer de droits
          d’accès, de rectification, d’effacement, de limitation,
          d’opposition le cas échéant, de portabilité le cas échéant, et de
          retrait du consentement lorsque le consentement est la base légale.
          Ces droits ne s’appliquent pas de façon inconditionnelle dans toutes
          les situations.
        </p>
        <p>
          Demandes :{" "}
          <a
            className="text-ml-accent underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ml-accent"
            href={`mailto:${LEGAL_OPERATOR.email}`}
          >
            {LEGAL_OPERATOR.email}
          </a>
          . Vous pouvez également introduire une réclamation auprès de la CNIL.
        </p>
      </LegalSection>

      <LegalSection id="deletion" title="15. Suppression de compte">
        <p>
          Un utilisateur authentifié peut demander la suppression de son compte
          directement depuis l’interface profil (« Supprimer mon compte »).
          Cette action vise les données cloud personnelles associées au compte{" "}
          {LEGAL_OPERATOR.productName}, conformément au comportement de la base
          de données et des procédures serveur.
        </p>
        <p>
          La suppression du compte cloud ne fait pas disparaître
          automatiquement la progression ou les données locales éventuellement
          présentes dans votre navigateur : celles-ci peuvent rester sur
          l’appareil jusqu’à effacement/réinitialisation locale.
        </p>
      </LegalSection>

      <LegalSection id="age" title="16. Âge">
        <p>
          L’expérience d’apprentissage anonyme de {LEGAL_OPERATOR.productName}{" "}
          peut être utilisée à partir de 13 ans.
        </p>
        <p>
          La création de compte en France est destinée aux utilisateurs âgés de
          15 ans ou plus, sauf autorisation requise du représentant légal.
          {LEGAL_OPERATOR.productName} ne met pas en place, à ce stade, un
          dispositif de consentement parental technique.
        </p>
      </LegalSection>

      <LegalSection id="security" title="17. Sécurité">
        <p>
          {LEGAL_OPERATOR.productName} met en œuvre des mesures techniques et
          organisationnelles raisonnables pour protéger les données de compte et
          d’application. Aucun système n’est totalement à l’abri des risques.
        </p>
      </LegalSection>

      <LegalSection id="updates" title="18. Mises à jour">
        <p>
          Cette politique peut évoluer avec {LEGAL_OPERATOR.productName}. Les
          modifications importantes donnent lieu à une mise à jour de la date
          de révision affichée en tête de page.
        </p>
      </LegalSection>

      <LegalSection id="contact" title="19. Contact">
        <LegalContactBlock />
        <p className="text-[length:var(--ml-text-sm)] text-ml-text-muted">
          Voir aussi les{" "}
          <Link
            href={LEGAL_PATHS.terms}
            className="text-ml-accent underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ml-accent"
          >
            Conditions d’utilisation
          </Link>
          .
        </p>
      </LegalSection>
    </LegalDocument>
  );
}
