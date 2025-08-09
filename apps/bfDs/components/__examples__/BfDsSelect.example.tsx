import { useState } from "react";
import { BfDsSelect, type BfDsSelectOption } from "../BfDsSelect.tsx";
import { BfDsForm } from "../BfDsForm.tsx";
import { BfDsCallout } from "../BfDsCallout.tsx";
import { BfDsFormSubmitButton } from "../BfDsFormSubmitButton.tsx";
import { BfDsCodeExample } from "../BfDsCodeExample.tsx";

export function BfDsSelectExample() {
  const [standaloneValue, setStandaloneValue] = useState("");
  const [typeaheadValue, setTypeaheadValue] = useState("");
  const [formData, setFormData] = useState({
    country: "",
    size: "",
    priority: "",
    searchableCountry: "",
  });
  const [notification, setNotification] = useState({
    message: "",
    details: "",
    visible: false,
  });

  const countryOptions: Array<BfDsSelectOption> = [
    { value: "us", label: "United States" },
    { value: "ca", label: "Canada" },
    { value: "uk", label: "United Kingdom" },
    { value: "de", label: "Germany" },
    { value: "fr", label: "France" },
  ];

  const sizeOptions: Array<BfDsSelectOption> = [
    { value: "xs", label: "Extra Small" },
    { value: "s", label: "Small" },
    { value: "m", label: "Medium" },
    { value: "l", label: "Large" },
    { value: "xl", label: "Extra Large" },
  ];

  const priorityOptions: Array<BfDsSelectOption> = [
    { value: "low", label: "Low Priority" },
    { value: "medium", label: "Medium Priority" },
    { value: "high", label: "High Priority" },
    { value: "urgent", label: "Urgent", disabled: true },
  ];

  const largeDatasetOptions: Array<BfDsSelectOption> = [
    { value: "af", label: "Afghanistan" },
    { value: "al", label: "Albania" },
    { value: "dz", label: "Algeria" },
    { value: "ar", label: "Argentina" },
    { value: "am", label: "Armenia" },
    { value: "au", label: "Australia" },
    { value: "at", label: "Austria" },
    { value: "az", label: "Azerbaijan" },
    { value: "bh", label: "Bahrain" },
    { value: "bd", label: "Bangladesh" },
    { value: "by", label: "Belarus" },
    { value: "be", label: "Belgium" },
    { value: "bz", label: "Belize" },
    { value: "bj", label: "Benin" },
    { value: "bo", label: "Bolivia" },
    { value: "ba", label: "Bosnia and Herzegovina" },
    { value: "bw", label: "Botswana" },
    { value: "br", label: "Brazil" },
    { value: "bn", label: "Brunei" },
    { value: "bg", label: "Bulgaria" },
    { value: "bf", label: "Burkina Faso" },
    { value: "bi", label: "Burundi" },
    { value: "kh", label: "Cambodia" },
    { value: "cm", label: "Cameroon" },
    { value: "ca", label: "Canada" },
    { value: "cv", label: "Cape Verde" },
    { value: "cf", label: "Central African Republic" },
    { value: "td", label: "Chad" },
    { value: "cl", label: "Chile" },
    { value: "cn", label: "China" },
    { value: "co", label: "Colombia" },
    { value: "km", label: "Comoros" },
    { value: "cg", label: "Congo" },
    { value: "cr", label: "Costa Rica" },
    { value: "ci", label: "Cote d'Ivoire" },
    { value: "hr", label: "Croatia" },
    { value: "cu", label: "Cuba" },
    { value: "cy", label: "Cyprus" },
    { value: "cz", label: "Czech Republic" },
    { value: "dk", label: "Denmark" },
    { value: "dj", label: "Djibouti" },
    { value: "dm", label: "Dominica" },
    { value: "do", label: "Dominican Republic" },
    { value: "ec", label: "Ecuador" },
    { value: "eg", label: "Egypt" },
    { value: "sv", label: "El Salvador" },
    { value: "gq", label: "Equatorial Guinea" },
    { value: "er", label: "Eritrea" },
    { value: "ee", label: "Estonia" },
    { value: "et", label: "Ethiopia" },
    { value: "fj", label: "Fiji" },
    { value: "fi", label: "Finland" },
    { value: "fr", label: "France" },
    { value: "ga", label: "Gabon" },
    { value: "gm", label: "Gambia" },
    { value: "ge", label: "Georgia" },
    { value: "de", label: "Germany" },
    { value: "gh", label: "Ghana" },
    { value: "gr", label: "Greece" },
    { value: "gd", label: "Grenada" },
    { value: "gt", label: "Guatemala" },
    { value: "gn", label: "Guinea" },
    { value: "gw", label: "Guinea-Bissau" },
    { value: "gy", label: "Guyana" },
    { value: "ht", label: "Haiti" },
    { value: "hn", label: "Honduras" },
    { value: "hu", label: "Hungary" },
    { value: "is", label: "Iceland" },
    { value: "in", label: "India" },
    { value: "id", label: "Indonesia" },
    { value: "ir", label: "Iran" },
    { value: "iq", label: "Iraq" },
    { value: "ie", label: "Ireland" },
    { value: "il", label: "Israel" },
    { value: "it", label: "Italy" },
    { value: "jm", label: "Jamaica" },
    { value: "jp", label: "Japan" },
    { value: "jo", label: "Jordan" },
    { value: "kz", label: "Kazakhstan" },
    { value: "ke", label: "Kenya" },
    { value: "ki", label: "Kiribati" },
    { value: "kp", label: "North Korea" },
    { value: "kr", label: "South Korea" },
    { value: "kw", label: "Kuwait" },
    { value: "kg", label: "Kyrgyzstan" },
    { value: "la", label: "Laos" },
    { value: "lv", label: "Latvia" },
    { value: "lb", label: "Lebanon" },
    { value: "ls", label: "Lesotho" },
    { value: "lr", label: "Liberia" },
    { value: "ly", label: "Libya" },
    { value: "li", label: "Liechtenstein" },
    { value: "lt", label: "Lithuania" },
    { value: "lu", label: "Luxembourg" },
    { value: "mk", label: "North Macedonia" },
    { value: "mg", label: "Madagascar" },
    { value: "mw", label: "Malawi" },
    { value: "my", label: "Malaysia" },
    { value: "mv", label: "Maldives" },
    { value: "ml", label: "Mali" },
    { value: "mt", label: "Malta" },
    { value: "mh", label: "Marshall Islands" },
    { value: "mr", label: "Mauritania" },
    { value: "mu", label: "Mauritius" },
    { value: "mx", label: "Mexico" },
    { value: "fm", label: "Micronesia" },
    { value: "md", label: "Moldova" },
    { value: "mc", label: "Monaco" },
    { value: "mn", label: "Mongolia" },
    { value: "me", label: "Montenegro" },
    { value: "ma", label: "Morocco" },
    { value: "mz", label: "Mozambique" },
    { value: "mm", label: "Myanmar" },
    { value: "na", label: "Namibia" },
    { value: "nr", label: "Nauru" },
    { value: "np", label: "Nepal" },
    { value: "nl", label: "Netherlands" },
    { value: "nz", label: "New Zealand" },
    { value: "ni", label: "Nicaragua" },
    { value: "ne", label: "Niger" },
    { value: "ng", label: "Nigeria" },
    { value: "no", label: "Norway" },
    { value: "om", label: "Oman" },
    { value: "pk", label: "Pakistan" },
    { value: "pw", label: "Palau" },
    { value: "pa", label: "Panama" },
    { value: "pg", label: "Papua New Guinea" },
    { value: "py", label: "Paraguay" },
    { value: "pe", label: "Peru" },
    { value: "ph", label: "Philippines" },
    { value: "pl", label: "Poland" },
    { value: "pt", label: "Portugal" },
    { value: "qa", label: "Qatar" },
    { value: "ro", label: "Romania" },
    { value: "ru", label: "Russia" },
    { value: "rw", label: "Rwanda" },
    { value: "kn", label: "Saint Kitts and Nevis" },
    { value: "lc", label: "Saint Lucia" },
    { value: "vc", label: "Saint Vincent and the Grenadines" },
    { value: "ws", label: "Samoa" },
    { value: "sm", label: "San Marino" },
    { value: "st", label: "Sao Tome and Principe" },
    { value: "sa", label: "Saudi Arabia" },
    { value: "sn", label: "Senegal" },
    { value: "rs", label: "Serbia" },
    { value: "sc", label: "Seychelles" },
    { value: "sl", label: "Sierra Leone" },
    { value: "sg", label: "Singapore" },
    { value: "sk", label: "Slovakia" },
    { value: "si", label: "Slovenia" },
    { value: "sb", label: "Solomon Islands" },
    { value: "so", label: "Somalia" },
    { value: "za", label: "South Africa" },
    { value: "ss", label: "South Sudan" },
    { value: "es", label: "Spain" },
    { value: "lk", label: "Sri Lanka" },
    { value: "sd", label: "Sudan" },
    { value: "sr", label: "Suriname" },
    { value: "sz", label: "Swaziland" },
    { value: "se", label: "Sweden" },
    { value: "ch", label: "Switzerland" },
    { value: "sy", label: "Syria" },
    { value: "tw", label: "Taiwan" },
    { value: "tj", label: "Tajikistan" },
    { value: "tz", label: "Tanzania" },
    { value: "th", label: "Thailand" },
    { value: "tl", label: "Timor-Leste" },
    { value: "tg", label: "Togo" },
    { value: "to", label: "Tonga" },
    { value: "tt", label: "Trinidad and Tobago" },
    { value: "tn", label: "Tunisia" },
    { value: "tr", label: "Turkey" },
    { value: "tm", label: "Turkmenistan" },
    { value: "tv", label: "Tuvalu" },
    { value: "ug", label: "Uganda" },
    { value: "ua", label: "Ukraine" },
    { value: "ae", label: "United Arab Emirates" },
    { value: "gb", label: "United Kingdom" },
    { value: "us", label: "United States" },
    { value: "uy", label: "Uruguay" },
    { value: "uz", label: "Uzbekistan" },
    { value: "vu", label: "Vanuatu" },
    { value: "va", label: "Vatican City" },
    { value: "ve", label: "Venezuela" },
    { value: "vn", label: "Vietnam" },
    { value: "ye", label: "Yemen" },
    { value: "zm", label: "Zambia" },
    { value: "zw", label: "Zimbabwe" },
  ];

  return (
    <div className="bfds-example">
      <h2>BfDsSelect Examples</h2>

      <div className="bfds-example__section">
        <h3>Usage</h3>
        <BfDsCodeExample
          language="tsx"
          code={`import { BfDsSelect, type BfDsSelectOption } from "@bfmono/apps/bfDs/components/BfDsSelect.tsx";

// Define options
const options: Array<BfDsSelectOption> = [
  { value: "1", label: "Option 1" },
  { value: "2", label: "Option 2", disabled: true }
];

// Basic usage
<BfDsSelect
  options={options}
  value={value}
  onChange={(val) => setValue(val)}
/>

// All available props
<BfDsSelect
  name="country"                  // string - form field name
  value=""                        // string - controlled value
  defaultValue=""                 // string - uncontrolled default
  onChange={(value) => {}}        // (value: string) => void
  options={options}               // Array<BfDsSelectOption> (required)
  placeholder="Select..."         // string - placeholder text
  label="Country"                 // string - field label
  required={false}                // boolean
  disabled={false}                // boolean
  className=""                    // string
  id="select-1"                   // string - element ID
  typeahead={false}               // boolean - enable search
/>`}
        />
      </div>

      <div className="bfds-example__section">
        <h3>Controlled vs Uncontrolled</h3>
        <div className="bfds-example__group">
          <BfDsSelect
            label="Controlled Select"
            options={countryOptions}
            value={standaloneValue}
            onChange={setStandaloneValue}
            placeholder="Choose a country"
          />
          <p>Selected: {standaloneValue || "None"}</p>

          <BfDsSelect
            label="Uncontrolled Select"
            options={sizeOptions}
            defaultValue="m"
            placeholder="Choose a size"
          />
          <p>This select manages its own state internally</p>
        </div>
      </div>

      <div className="bfds-example__section">
        <h3>Typeahead Select</h3>
        <div className="bfds-example__group">
          <BfDsSelect
            label="Country (with Typeahead)"
            options={largeDatasetOptions}
            value={typeaheadValue}
            onChange={setTypeaheadValue}
            placeholder="Type to search countries..."
            typeahead
          />
          <p>
            Selected: {typeaheadValue
              ? largeDatasetOptions.find((opt) => opt.value === typeaheadValue)
                ?.label
              : "None"}
          </p>
          <div className="bfds-example__item">
            <strong>Typeahead Features:</strong>
            <ul style={{ margin: "8px 0", paddingLeft: "20px" }}>
              <li>Type to filter options in real-time</li>
              <li>Use arrow keys to navigate</li>
              <li>Press Enter to select highlighted option</li>
              <li>Press Escape to close dropdown</li>
              <li>Click outside to close</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bfds-example__section">
        <h3>With BfDsForm Integration</h3>
        <BfDsForm
          initialData={formData}
          onSubmit={(data: unknown) => {
            setNotification({
              message: "Form submitted successfully!",
              details: JSON.stringify(data, null, 2),
              visible: true,
            });
            setFormData(data as typeof formData);
          }}
        >
          <div className="bfds-example__group">
            <BfDsSelect
              name="country"
              label="Country"
              options={countryOptions}
              placeholder="Select country"
              required
            />

            <BfDsSelect
              name="size"
              label="Size"
              options={sizeOptions}
              placeholder="Select size"
            />

            <BfDsSelect
              name="priority"
              label="Priority"
              options={priorityOptions}
              placeholder="Select priority"
            />

            <BfDsSelect
              name="searchableCountry"
              label="Searchable Country"
              options={largeDatasetOptions}
              placeholder="Type to search countries..."
              typeahead
            />

            <BfDsFormSubmitButton text="Submit Form" />
          </div>
        </BfDsForm>
        <BfDsCallout
          variant="success"
          details={notification.details}
          visible={notification.visible}
          onDismiss={() =>
            setNotification({ message: "", details: "", visible: false })}
          autoDismiss={5000}
        >
          {notification.message}
        </BfDsCallout>
      </div>

      <div className="bfds-example__section">
        <h3>States</h3>
        <div className="bfds-example__group">
          <BfDsSelect
            label="Disabled"
            options={countryOptions}
            placeholder="This is disabled"
            disabled
          />

          <BfDsSelect
            label="Required"
            options={countryOptions}
            placeholder="This is required"
            required
          />

          <BfDsSelect
            label="With Disabled Options"
            options={priorityOptions}
            placeholder="Some options disabled"
          />
        </div>
      </div>

      <div className="bfds-example__section">
        <h3>Typeahead States</h3>
        <div className="bfds-example__group">
          <BfDsSelect
            label="Typeahead Required"
            options={countryOptions}
            placeholder="This is required with typeahead"
            typeahead
            required
          />

          <BfDsSelect
            label="Typeahead Disabled"
            options={countryOptions}
            placeholder="This is disabled with typeahead"
            typeahead
            disabled
          />

          <BfDsSelect
            label="Small Dataset Typeahead"
            options={sizeOptions}
            placeholder="Typeahead with few options"
            typeahead
          />
        </div>
      </div>
    </div>
  );
}
