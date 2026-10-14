# How to use this thing

Open [the QR dithering app](https://silvio-qr-dithering.pgs.sh/).

but if you really want to run it yourself:

## Clone the repo

```sh
git clone https://github.com/codemyriad/dithered-qr-codes.git
cd dithered-qr-codes
```

## Install the QR code library

```sh
yarn
```

you might need install yarn and/or node first. `npm install` ought to work too

## Start hosting

```sh
yarn serve
```

or `npm run serve` if you don't have `yarn` installed and don't want to install it

## License

GNU Affero General Public License version 3 only (AGPL-3.0-only). See [LICENSE](LICENSE).

## QR encoding

Numeric, alphanumeric and UTF-8 byte segments are selected automatically by `qrcode`.
HTTP(S) URLs use uppercase schemes and ASCII hostnames by default; credentials,
ports, paths, query strings and fragments retain their exact spelling. Other text
is unchanged. Disable **Optimize URLs** when the scanned text must match exactly.
The form shows the actual encoded text and QR version.

**Minimum size** still defaults to version 6 to leave room for the picture. Set it
to 1 for the smallest code that fits. Larger inputs grow automatically. All four
error correction levels and all eight masks are supported.

## Test and deploy

Use Node.js 24 or newer for the TypeScript tests:

```sh
yarn test
yarn build
yarn deploy
```

The build serves from a domain root. Deployment uploads `dist/` to the
`qr-dithering` project on pgs.sh using your SSH identity.

Originally created by [Andrew Taylor](https://www.andrewt.net/).
