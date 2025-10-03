import React from "react";
import { Helmet } from "react-helmet";

import { FlexRow, Page, PillButton, Stack } from "./components.jsx";

export function TermsAndConditions() {
    return <Page>
        <Helmet>
            <title> Privacy Policy | boikot </title>
        </Helmet>
        <Stack>
            <h1> Terms and Conditions </h1>
            <p> These Terms and Conditions ("Terms") govern your use of the boikot website ({window.location.host}) and any related services provided by boikot ("Service"). By accessing or using the Service, you agree to be bound by these Terms. </p>
            <h2> 1. User Content: </h2>
            <p> You are solely responsible for any content you submit to the Service, including but not limited to ratings, reviews, comments, and other information ("User Content"). By submitting User Content, you grant boikot a non-exclusive, royalty-free, perpetual, irrevocable, and fully sublicensable right to use, reproduce, modify, adapt, publish, translate, create derivative works from, distribute, and display such User Content throughout the world in any media. </p>
            <h2> 2. Prohibited Conduct: </h2>
            <p> In your use of the Service you agree not to: </p>
            <p style={{ marginTop: "-0.5rem" }}> - Use the Service for any illegal purpose or in violation of any local, state, national, or international law. </p>
            <p style={{ marginTop: "-0.5rem" }}> - Harass, abuse, or harm another person or engage in any other disruptive behavior. </p>
            <p style={{ marginTop: "-0.5rem" }}> - Interfere with or disrupt the Service or servers or networks connected to the Service. </p>
            <p style={{ marginTop: "-0.5rem" }}> - Impersonate any person or entity or falsely state or otherwise misrepresent your affiliation with a person or entity. </p>
            <h2> 3. Intellectual Property: </h2>
            <p> The Service and its original content, features, and functionality are owned by boikot and are protected by international copyright, trademark, patent, trade secret, and other intellectual property or proprietary rights laws. </p>
            <h2> 4. Limitation of Liability: </h2>
            <p> In no event shall boikot, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from (i) your access to or use of or inability to access or use the Service; (ii) any conduct or content of any third party on the Service; (iii) any content obtained from the Service; and (iv) unauthorized access, use, or alteration of your transmissions or content, whether based on warranty, contract, tort (including negligence), or any other legal theory, whether or not we have been informed of the possibility of such damage, and even if a remedy set forth herein is found to have failed of its essential purpose. </p>
            <h2> 5. Indemnification: </h2>
            <p> You agree to indemnify and hold boikot and its affiliates, directors, officers, employees, and agents harmless from and against any liabilities, losses, damages, or costs, including reasonable attorneys' fees, incurred in connection with or arising from any third-party allegations, claims, actions, disputes, or demands asserted against any of them as a result of or relating to your User Content, your use of the Service, or any breach of these Terms. </p>
            <h2> 6. Changes: </h2>
            <p> We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion. </p>
            <h2> 7. Contact Us: </h2>
            <p> If you have any questions about these Terms, please contact us at hello@boikot.xyz. </p>
            <strong> Last updated: 17th Feb 2024 </strong>
        </Stack>
    </Page>;
}

