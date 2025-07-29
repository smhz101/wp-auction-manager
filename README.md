# WP Auction Manager

WP Auction Manager extends WooCommerce with auction functionality. Translation files live in the `languages` directory.

## Updating the POT file

Run the following command from the plugin root to regenerate the template file:

```bash
php wp-cli.phar i18n make-pot . languages/wp-auction-manager.pot --allow-root
```

## Creating translations

1. Create a `.po` file from the POT template using `msginit` or any PO editor. For example:
   ```bash
   msginit --locale=fr_FR --input=languages/wp-auction-manager.pot \
     --output-file=languages/wp-auction-manager-fr_FR.po
   ```
2. After translating, compile the `.po` file into a `.mo` file:
   ```bash
   msgfmt languages/wp-auction-manager-fr_FR.po \
     -o languages/wp-auction-manager-fr_FR.mo
   ```
3. Place the resulting `.mo` file in the `languages` directory.
