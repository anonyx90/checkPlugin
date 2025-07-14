import { imageSizeCheck } from "./imageSizeCheck";
import { imageAltTextCheck } from "./imageAltText";
import { autoImageResolution } from "./autoImageResolution";
import { lockedImagesCheck } from "./lockedImages";
import { placeholderTextCheck } from "./placeHolder";
import { layerNamingCheck } from "./validateLayer";
import { emptyTextCheck } from "./emptyText";
import { genericComponentNamesCheck } from "./genericComponentNames";
import { reusableContentCheck } from "./reusableContent";
import { reusableContentByNameCheck } from "./reusableContentByName";
import { cmsUnusedCollectionsCheck } from "./cmsUnusedCollections";
import { cmsFieldTypeValidationCheck } from "./cmsFieldTypeValidationCheck";
import { cmsUnlinkedCollectionsCheck } from "./cmsUnlinkedCollectionsCheck";
import { mailtoTelLinksCheck } from "./mailtoTelLinks";
import { unusedComponentsCheck } from "./unusedComponents";
import { custom404Check } from "./custom404Check";
import { responsiveLayoutCheck } from "./responsiveLayoutCheck";
import { unusedPagesCheck } from "./unusedPage";
import { cmsFieldNamingCheck } from "./cmsFieldNamingCheck";
import { cmsDuplicateFieldNamesCheck } from "./cmsDuplicateFieldNamesCheck";
import { languageDefinedCheck } from "./launguageCheck";
import { tooManyChildrenCheck } from "./tooManyChildren";
import { unusedStylesCheck } from "./unusedStyles";
import { accessibilityTagCheck } from "./accessibilityTagCheck";
import { linkValidationCheck } from "./urlCheck";
import { cmsArticleCheck } from "./cmsArticleCheck";
import { typographyHierarchyCheck } from "./typography";
import { colorContrastCheck } from "./colorContrastCheck";
import { projectNameCheck } from "./projectName";

export const checks = [
  imageSizeCheck,
  imageAltTextCheck,
  autoImageResolution,
  lockedImagesCheck,
  placeholderTextCheck,
  layerNamingCheck,
  emptyTextCheck,
  genericComponentNamesCheck,
  reusableContentCheck,
  reusableContentByNameCheck,
  cmsUnusedCollectionsCheck,
  cmsFieldTypeValidationCheck,
  cmsUnlinkedCollectionsCheck,
  mailtoTelLinksCheck,
  unusedComponentsCheck,
  custom404Check,
  responsiveLayoutCheck,
  unusedPagesCheck,
  cmsFieldNamingCheck,
  cmsDuplicateFieldNamesCheck,
  languageDefinedCheck,
  tooManyChildrenCheck,
  unusedStylesCheck,
  accessibilityTagCheck,
  linkValidationCheck,
  cmsArticleCheck,
  typographyHierarchyCheck,
  colorContrastCheck,
  projectNameCheck,
];


//new image realed check that checks for blury and DPI

// image related check to be error instead of warning

//critical

//internal link checks

//styles API look  it up

// text layer empty check

//reptative element

//layer naming skip if component

//cms checkindividual 

//pagination check

//no of critical and red color