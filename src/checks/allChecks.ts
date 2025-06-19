
import { cmsUnusedCollectionsCheck } from "./cmsUnusedCollections";
import { cmsFieldTypeValidationCheck } from "./cmsFieldTypeValidationCheck";
import { cmsUnlinkedCollectionsCheck } from "./cmsUnlinkedCollectionsCheck";
import { emptyTextCheck } from "./emptyText";
import { genericComponentNamesCheck } from "./genericComponentNames";
import { imageAltTextCheck } from "./imageAltText";
import { lockedImagesCheck } from "./lockedImages";
import { placeholderTextCheck } from "./placeHolder";
import { reusableContentCheck } from "./reusableContent";
import { reusableContentByNameCheck } from "./reusableContentByName";
import { cmsFieldNamingCheck } from "./cmsFieldNamingCheck";
import { cmsDuplicateFieldNamesCheck } from "./cmsDuplicateFieldNamesCheck";
import { imageSizeCheck } from "./imageSizeCheck";
import { custom404Check } from "./custom404Check";
import { imageMobileResolutionCheck } from "./imageMobileResolutionCheck";
import { languageDefinedCheck } from "./launguageCheck";
import { tooManyChildrenCheck } from "./tooManyChildren";
import { unusedStylesCheck } from "./unusedStyles";
import { unusedPagesCheck } from "./unusedPage";
import { missingStacksCheck } from "./missingStackChecks";
import { accessibilityTagCheck } from "./accessibilityTagCheck";
import { mailtoTelLinksCheck } from "./mailtoTelLinks";
import { unusedComponentsCheck } from "./unusedComponents";
import { autoImageResolution } from "./autoImageResolution";
import { layerNamingCheck } from "./validateLayer";
import { cmsArticleCheck } from "./cmsArticleCheck";
import { linkValidationCheck } from "./urlCheck";




export const checks = [
  placeholderTextCheck,
  layerNamingCheck,
  emptyTextCheck,
  genericComponentNamesCheck,
  reusableContentCheck,
  reusableContentByNameCheck,
  imageAltTextCheck,
  lockedImagesCheck,
  cmsUnusedCollectionsCheck,
  cmsFieldTypeValidationCheck,
  cmsUnlinkedCollectionsCheck,
  mailtoTelLinksCheck,
  unusedComponentsCheck,
  autoImageResolution, 
  custom404Check,
  // responsiveLayoutCheck,
  unusedPagesCheck, 
  missingStacksCheck,
  cmsFieldNamingCheck,
  cmsDuplicateFieldNamesCheck,
  imageSizeCheck,
  imageMobileResolutionCheck,
  // projectInfoChecklist,
  languageDefinedCheck,
  tooManyChildrenCheck,
  unusedStylesCheck,
  accessibilityTagCheck,
  linkValidationCheck,
  cmsArticleCheck 
];