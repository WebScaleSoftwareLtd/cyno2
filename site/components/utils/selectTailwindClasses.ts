export default {
    control: () => "dark:!bg-gray-800 dark:!border-gray-700",
    indicatorSeparator: () => "dark:!bg-gray-700",
    dropdownIndicator: () => "active:dark:!bg-gray-700",
    input: () => "dark:!text-white",
    menu: () => "dark:!bg-gray-800 dark:!border-gray-700",
    option: () => "dark:hover:!bg-gray-700 dark:!bg-gray-800",
    singleValue: () => "dark:!text-white",
    multiValue: () => "dark:!bg-gray-700",
    multiValueLabel: () => "dark:!text-white",
    multiValueRemove: () => "dark:hover:!bg-gray-700",
} as const;
