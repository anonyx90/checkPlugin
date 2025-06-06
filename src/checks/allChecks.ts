
import { cmsUnusedCollectionsCheck } from "./cmsUnusedCollections";
import { cmsFieldTypeValidationCheck } from "./cmsFieldTypeValidationCheck";
import { cmsUnlinkedCollectionsCheck } from "./cmsUnlinkedCollectionsCheck";
// import { cmsMissingPreviewImagesCheck } from "./cmsMissingPreviewImagesCheck";
import { emptyTextCheck } from "./emptyText";
import { genericComponentNamesCheck } from "./genericComponentNames";
import { imageAltTextCheck } from "./imageAltText";
import { lockedImagesCheck } from "./lockedImages";
// import { mailtoTelLinksCheck } from "./mailtoTelLinks";
import { placeholderTextCheck } from "./placeHolder";
import { reusableContentCheck } from "./reusableContent";
import { reusableContentByNameCheck } from "./reusableContentByName";
import { unnamedLayersCheck } from "./unnamedLayer";
// import { unusedComponentsCheck } from "./unusedComponents";
// import { unusedPagesCheck } from "./unusedPage";
// import { breakpointsCheck } from "./breakpointsCheck";
// import { missingStacksCheck } from "./missingStackChecks";
import { cmsFieldNamingCheck } from "./cmsFieldNamingCheck";
import { cmsMissingFieldBindingsCheck } from "./cmsMissingFieldBindingsCheck";
import { cmsDuplicateFieldNamesCheck } from "./cmsDuplicateFieldNamesCheck";
import { imageSizeCheck } from "./imageSizeCheck";
// import { autoImageResolution } from "./autoImageResolution";
// import { custom404Check } from "./custom404Check";
// import { responsiveLayoutCheck } from "./responsiveLayoutCheck";
import { imageMobileResolutionCheck } from "./imageMobileResolutionCheck";
import { projectInfoChecklist } from "./getLocale";
import { languageDefinedCheck } from "./launguageCheck";
import { tooManyChildrenCheck } from "./tooManyChildren";
import { unusedStylesCheck } from "./unusedStyles";
// import { tooManyChildrenCheck } from "./tooManyChildren";
// import { unusedStylesCheck } from "./unusedStyles";


export const checks = [
  placeholderTextCheck,
  unnamedLayersCheck,
  emptyTextCheck,
  genericComponentNamesCheck,
  reusableContentCheck,
  reusableContentByNameCheck,
  imageAltTextCheck,
  lockedImagesCheck,
  cmsUnusedCollectionsCheck,
  cmsFieldTypeValidationCheck,
  cmsUnlinkedCollectionsCheck,
// cmsMissingPreviewImagesCheck,
//   mailtoTelLinksCheck,
//   unusedComponentsCheck,
//   autoImageResolution,
//   custom404Check,
//   responsiveLayoutCheck,
//   breakpointsCheck,
//   unusedPagesCheck,
//   missingStacksCheck,
  cmsFieldNamingCheck,
  cmsMissingFieldBindingsCheck,
  cmsDuplicateFieldNamesCheck,
  imageSizeCheck,
  imageMobileResolutionCheck,
  projectInfoChecklist,
  languageDefinedCheck,
  tooManyChildrenCheck,
  unusedStylesCheck,
];
