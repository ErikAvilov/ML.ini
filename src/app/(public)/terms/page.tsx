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
  title: "Conditions d'utilisation | MLINI",
  description: "Conditions d'utilisation de la plateforme MLINI.",
  alternates: { canonical: LEGAL_URLS.terms },
};

export default function TermsPage() {
  return (
    <LegalDocument title="Conditions d'utilisation">
      <LegalSection id="operator" title="1. Exploitant">
        <p>
          {LEGAL_OPERATOR.productName} est exploité par{" "}
          {LEGAL_OPERATOR.operatorName}, {LEGAL_OPERATOR.status}.
        </p>
        <p>SIREN : {LEGAL_OPERATOR.siren}</p>
        <p>
          Contact :{" "}
          <a
            className="text-ml-accent underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ml-accent"
            href={`mailto:${LEGAL_OPERATOR.email}`}
          >
            {LEGAL_OPERATOR.email}
          </a>
        </p>
      </LegalSection>

      <LegalSection id="purpose" title="2. Objet du service">
        <p>
          MLINI est une plateforme interactive gamifiée permettant d’apprendre
          à construire avec l’intelligence artificielle au travers de missions
          et d’exercices pratiques.
        </p>
        <p>
          {LEGAL_OPERATOR.productName} n’est pas présenté comme une école, une
          université accréditée ou un organisme de formation réglementé.
        </p>
      </LegalSection>

      <LegalSection id="access" title="3. Accès">
        <p>
          Une partie de {LEGAL_OPERATOR.productName} peut être accessible sans
          compte. Le Royaume I prend actuellement en charge un usage anonyme.
          Certaines fonctionnalités nécessitent un compte. Le service est
          actuellement gratuit. {LEGAL_OPERATOR.productName} peut introduire
          ultérieurement des fonctionnalités payantes optionnelles ; cela ne
          signifie pas que toutes les fonctionnalités resteront gratuites pour
          toujours.
        </p>
      </LegalSection>

      <LegalSection id="age" title="4. Âge">
        <p>
          Expérience anonyme : à partir de 13 ans. Création de compte en France
          : destinée aux utilisateurs de 15 ans ou plus, sauf autorisation
          légalement requise du représentant légal. Aucun dispositif technique
          de consentement parental n’est mis en place dans le cadre de ces
          Conditions.
        </p>
      </LegalSection>

      <LegalSection id="account" title="5. Compte">
        <p>
          Les utilisateurs qui créent un compte s’authentifient via les
          prestataires OAuth disponibles, choisissent un pseudo{" "}
          {LEGAL_OPERATOR.productName} unique, ne doivent pas usurper
          l’identité d’autrui, ne doivent pas tenter de compromettre le compte
          d’un autre utilisateur, et restent responsables d’une utilisation
          raisonnablement sécurisée de leur accès/session. L’adresse e-mail
          n’est pas affichée publiquement par {LEGAL_OPERATOR.productName}.
        </p>
      </LegalSection>

      <LegalSection id="acceptable-use" title="6. Usage acceptable">
        <p>Il est interdit notamment de :</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            tenter de contourner les contrôles d’authentification ou de
            sécurité ;
          </li>
          <li>accéder sans autorisation aux systèmes ou données ;</li>
          <li>générer un trafic automatisé abusif ;</li>
          <li>
            exploiter le service dans le but de le perturber ;
          </li>
          <li>
            manipuler l’XP ou la progression par des moyens non autorisés ;
          </li>
          <li>
            attaquer {LEGAL_OPERATOR.productName} ou ses prestataires ;
          </li>
          <li>utiliser le service de manière illicite ;</li>
          <li>usurper l’identité d’autrui.</li>
        </ul>
        <p>
          Ces interdictions ne visent pas l’expérimentation pédagogique normale
          prévue dans les exercices.
        </p>
      </LegalSection>

      <LegalSection id="ai" title="7. Sorties d’IA">
        <p>
          Certaines missions utilisent de l’IA générative. Les réponses du
          modèle peuvent varier, contenir des erreurs, ou être temporairement
          indisponibles. Elles s’inscrivent dans une expérience éducative
          interactive. Elles ne constituent pas un conseil juridique, médical
          ou financier, ni une vérité factuelle garantie.
        </p>
      </LegalSection>

      <LegalSection id="learning" title="8. Apprentissage et emploi">
        <p>
          {LEGAL_OPERATOR.productName} propose une expérience d’apprentissage
          pratique. L’achèvement de missions, de Royaumes, de succès ou
          d’éventuels certificats futurs ne garantit pas un emploi, un
          apprentissage, une qualification professionnelle ou un diplôme
          reconnu par l’État, sauf reconnaissance formelle ultérieure.
        </p>
      </LegalSection>

      <LegalSection id="progression" title="9. Progression virtuelle">
        <p>
          L’XP, les niveaux, compétences, succès, titres et éléments
          cosmétiques de profil, lorsqu’ils sont implémentés, constituent une
          progression produit virtuelle. Ils n’ont pas de valeur monétaire.{" "}
          {LEGAL_OPERATOR.productName} peut rééquilibrer progression et
          récompenses à mesure que le produit évolue.
        </p>
      </LegalSection>

      <LegalSection id="ip" title="10. Propriété intellectuelle">
        <p>
          La marque {LEGAL_OPERATOR.productName}, l’interface, les textes
          originaux, exercices et contenus originaux sont protégés par les
          règles applicables de propriété intellectuelle le cas échéant. Les
          utilisateurs disposent d’un droit personnel d’accès et d’usage du
          service. Aucune marque déposée n’est affirmée ici.{" "}
          {LEGAL_OPERATOR.productName} ne revendique pas la propriété des
          technologies ou marques de tiers.
        </p>
      </LegalSection>

      <LegalSection id="input" title="11. Contenus saisis par l’utilisateur">
        <p>
          {LEGAL_OPERATOR.productName} ne revendique pas automatiquement la
          propriété de tout ce que vous saisissez. Vous restez responsable des
          contenus soumis et ne devez pas transmettre de contenus illicites,
          portant atteinte à des droits, ou contenant inutilement des
          informations personnelles sensibles. Lorsque du contenu d’exercice
          est transmis à un fournisseur d’IA, la{" "}
          <Link
            href={LEGAL_PATHS.privacy}
            className="text-ml-accent underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ml-accent"
          >
            Politique de confidentialité
          </Link>{" "}
          décrit le traitement.
        </p>
      </LegalSection>

      <LegalSection id="availability" title="12. Disponibilité">
        <p>
          {LEGAL_OPERATOR.productName} est un service en évolution. Des
          fonctionnalités peuvent changer, être mises à jour, devenir
          temporairement indisponibles, être retirées ou remplacées. Aucune
          disponibilité à 100 % n’est promise.
        </p>
      </LegalSection>

      <LegalSection id="suspension" title="13. Suspension de compte">
        <p>
          {LEGAL_OPERATOR.productName} peut suspendre ou restreindre un compte
          lorsque cela est raisonnablement nécessaire en cas de violation
          grave des présentes Conditions, d’attaques de sécurité, de fraude,
          d’usage automatisé abusif ou de manipulation non autorisée.
        </p>
      </LegalSection>

      <LegalSection id="deletion" title="14. Suppression de compte">
        <p>
          Les utilisateurs authentifiés peuvent supprimer leur compte{" "}
          {LEGAL_OPERATOR.productName} depuis l’interface profil. Des demandes
          relatives à la vie privée peuvent aussi être adressées à{" "}
          <a
            className="text-ml-accent underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ml-accent"
            href={`mailto:${LEGAL_OPERATOR.email}`}
          >
            {LEGAL_OPERATOR.email}
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection id="liability" title="15. Responsabilité">
        <p>
          Dans les limites autorisées par le droit applicable, et sans
          écarter les droits impératifs des consommateurs : les contenus
          éducatifs et d’IA peuvent comporter des inexactitudes ; des
          interruptions temporaires peuvent survenir ; vous restez responsable
          de l’usage que vous faites des informations en dehors de{" "}
          {LEGAL_OPERATOR.productName}.
        </p>
      </LegalSection>

      <LegalSection id="third-parties" title="16. Services tiers">
        <p>
          {LEGAL_OPERATOR.productName} s’appuie sur des prestataires techniques
          pouvant inclure, selon les fonctionnalités : Vercel, Neon, Google,
          GitHub et Google Gemini. L’usage de ces services peut aussi être
          soumis à leurs propres conditions et politiques de confidentialité.
        </p>
      </LegalSection>

      <LegalSection id="changes" title="17. Modifications">
        <p>
          {LEGAL_OPERATOR.productName} peut mettre à jour les présentes
          Conditions à mesure que le produit évolue. La date de révision est
          affichée en tête de page. Les changements importants donnent lieu à
          une mise à jour de cette date.
        </p>
      </LegalSection>

      <LegalSection id="law" title="18. Droit applicable">
        <p>
          {LEGAL_OPERATOR.productName} est exploité depuis la France. Les
          présentes Conditions sont régies par le droit français, sous réserve
          des protections impératives des consommateurs/utilisateurs qui
          peuvent s’appliquer.
        </p>
      </LegalSection>

      <LegalSection id="contact" title="19. Contact">
        <LegalContactBlock />
        <p className="text-[length:var(--ml-text-sm)] text-ml-text-muted">
          Voir aussi la{" "}
          <Link
            href={LEGAL_PATHS.privacy}
            className="text-ml-accent underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ml-accent"
          >
            Politique de confidentialité
          </Link>
          .
        </p>
      </LegalSection>
    </LegalDocument>
  );
}
