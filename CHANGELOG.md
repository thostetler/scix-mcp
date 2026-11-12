# Changelog

## [3.0.0](https://github.com/thostetler/scix-mcp/compare/v2.0.0...v3.0.0) (2026-11-12)


### ⚠ BREAKING CHANGES

* update_permissions drops `owner` and adds `none`. Ownership moves via transfer_library; `none` revokes access.
* **library:** update_permissions drops the owner level (ownership moves via transfer_library) and adds none to revoke access.

### Features

* add get_facets tool and filter_query, point at SciX hosts ([76e9fff](https://github.com/thostetler/scix-mcp/commit/76e9fff42f6092640307ba5fa11c5cba453d3248))
* add get_facets tool and filter_query, point at SciX hosts ([4cf4d45](https://github.com/thostetler/scix-mcp/commit/4cf4d450ebcbc3e19f56e420d95a5edf074fdb8b))
* add health_check diagnostic tool ([718df1e](https://github.com/thostetler/scix-mcp/commit/718df1e94b403cfa304a8b6b50539a1a43d1ccf2))
* add health_check diagnostic tool ([b7306d9](https://github.com/thostetler/scix-mcp/commit/b7306d9fe713d436cf6508bc51ab1cf2748a8671))
* Add MCP prompts and comprehensive usage guide ([d0cd6ad](https://github.com/thostetler/scix-mcp/commit/d0cd6ad11d0880bfebcb4bd245d31f1178e6257a))
* Add MCP prompts and comprehensive usage guide ([57e4f49](https://github.com/thostetler/scix-mcp/commit/57e4f4973b0a267c93c1d5c2148edf4fa5f268f6))
* Expand export tool to support all 23 formats and custom templates ([85fac3e](https://github.com/thostetler/scix-mcp/commit/85fac3ec8f370a64f85f768e8934b3a6c0ab29db))
* **http:** add Streamable HTTP transport for hosted deployment ([a4f4133](https://github.com/thostetler/scix-mcp/commit/a4f41335771a50fc19677b1981e3cacf81b7efc3))
* **http:** add Streamable HTTP transport for hosted deployment ([65f9610](https://github.com/thostetler/scix-mcp/commit/65f96102e10d74ce3de4006dbe1997bd730649d6))


### Bug Fixes

* accept DOI/arXiv/SciX ids and quote identifier queries ([3511544](https://github.com/thostetler/scix-mcp/commit/3511544bd4dd52b344be6d0ddce78372f797e1de))
* accept DOI/arXiv/SciX ids and quote identifier queries ([4c6bcf6](https://github.com/thostetler/scix-mcp/commit/4c6bcf64db5738477d334a500ee94d7865d4f9b0))
* **client:** report accurate errors for 403, 429, network, and 5xx ([63fcca7](https://github.com/thostetler/scix-mcp/commit/63fcca725f7ed19b891b20ff7eaec3e660ff5dba))
* **client:** report accurate errors for 403, 429, network, and 5xx ([c581946](https://github.com/thostetler/scix-mcp/commit/c581946b95984cecb8bbf576c94b8ee9f9fb6bf1))
* construct SciX API client lazily to avoid startup crash ([954c09c](https://github.com/thostetler/scix-mcp/commit/954c09cbd4721b8500b0ae08bfb443ea7edf4893)), closes [#9](https://github.com/thostetler/scix-mcp/issues/9)
* harden SciX client body parsing and typed-error prototype ([b2dca0e](https://github.com/thostetler/scix-mcp/commit/b2dca0e8ba565a0d639d9575bd38afa130165b92))
* harden SCIX_API_BASE override and de-dup e2e CI build ([474b2ae](https://github.com/thostetler/scix-mcp/commit/474b2ae83e136c6b6f837f9315750113f82161bd))
* **http:** close rejected connections instead of draining them ([a5dd6ea](https://github.com/thostetler/scix-mcp/commit/a5dd6ea00e840b3f3ba611e9cc921378ab41a62e))
* **http:** return 400 for malformed request targets ([7ab2cd8](https://github.com/thostetler/scix-mcp/commit/7ab2cd899f17bd5830f2f6ebbb96394b4d35f42a))
* **index:** include package.json path in version-read failures ([3a000c8](https://github.com/thostetler/scix-mcp/commit/3a000c8793a22ca5b3952daa333321b7b081660f))
* lazy SciX client init, dispatch hardening, tests, and 1.0.15 ([ae6ee1c](https://github.com/thostetler/scix-mcp/commit/ae6ee1c234fa7a3a243c14bfc26a678291dd78a0))
* **library:** accept partial edit_library responses ([c79ee0d](https://github.com/thostetler/scix-mcp/commit/c79ee0db6c000d5e4e7dd04d0a38b9316df0a69d))
* **library:** accept partial edit_library responses ([3dbd5d3](https://github.com/thostetler/scix-mcp/commit/3dbd5d3c9ea1cfd742b8c74c70a4b14454d17590))
* **library:** match biblib's permission shapes ([6e9e52d](https://github.com/thostetler/scix-mcp/commit/6e9e52dbc2913655be563d3d3ec2804245f72aec))
* **library:** point annotation tools at biblib's real notes route ([6e91636](https://github.com/thostetler/scix-mcp/commit/6e916360543b34d6463f9fc6133007b542cf7c44))
* **library:** point annotation tools at biblib's real notes route ([1b392d6](https://github.com/thostetler/scix-mcp/commit/1b392d6a2589d2596f2834f83bdb9784479ac956))
* **library:** post bibcode, not bibcodes, to biblib create ([65d62bc](https://github.com/thostetler/scix-mcp/commit/65d62bca467ee7e0738f1e379e96e5afb5918f54))
* **library:** post bibcode, not bibcodes, to biblib create ([50c0722](https://github.com/thostetler/scix-mcp/commit/50c07229c7fc0311bfd0e34b5a90e294c1791517))
* **library:** remove dead query endpoint, fix operation fields ([1298faa](https://github.com/thostetler/scix-mcp/commit/1298faa6efad93c1ed8620dc02a92eadc73bda3a))
* **library:** remove dead query endpoint, fix operation fields ([76813c3](https://github.com/thostetler/scix-mcp/commit/76813c3528068ce4f3d05fbe68771147b78e9b20))
* **library:** validate identifiers before building API paths ([a425600](https://github.com/thostetler/scix-mcp/commit/a425600f7a2bf143cf0bbcd0bc6ed43142fbed1f))
* run search_docs without a token; restore npx bin startup ([b07794f](https://github.com/thostetler/scix-mcp/commit/b07794f0f83da6dd0c70b05ccc8be8d4d3f70a38))
* **tools:** mark state-removing tools as destructive ([ad6dca0](https://github.com/thostetler/scix-mcp/commit/ad6dca0d3ef92819cb51eaa04efd4839d543b35c))
* Use npm publish for OIDC trusted publishing ([f03f04e](https://github.com/thostetler/scix-mcp/commit/f03f04e3531c05ae22ed026b8da84988bf1d1d37))
* Use npm publish for OIDC trusted publishing ([f4ac7a3](https://github.com/thostetler/scix-mcp/commit/f4ac7a38fcb421aa49bc2b1f6cc7a9b36964e4c4))


### Miscellaneous Chores

* force a 2.0.0 release for the permission enum change ([9d76def](https://github.com/thostetler/scix-mcp/commit/9d76def4f6ecffdb8940c29d83754511783a40da))

## [2.0.0](https://github.com/adsabs/scix-mcp/compare/v1.3.1...v2.0.0) (2026-11-05)


### ⚠ BREAKING CHANGES

* update_permissions drops `owner` and adds `none`. Ownership moves via transfer_library; `none` revokes access.

### Bug Fixes

* **library:** accept partial edit_library responses ([c79ee0d](https://github.com/adsabs/scix-mcp/commit/c79ee0db6c000d5e4e7dd04d0a38b9316df0a69d))
* **library:** remove dead query endpoint, fix operation fields ([1298faa](https://github.com/adsabs/scix-mcp/commit/1298faa6efad93c1ed8620dc02a92eadc73bda3a))


### Miscellaneous Chores

* force a 2.0.0 release for the permission enum change ([9d76def](https://github.com/adsabs/scix-mcp/commit/9d76def4f6ecffdb8940c29d83754511783a40da))

## [1.3.1](https://github.com/adsabs/scix-mcp/compare/v1.3.0...v1.3.1) (2026-11-05)


### Bug Fixes

* **client:** report accurate errors for 403, 429, network, and 5xx ([63fcca7](https://github.com/adsabs/scix-mcp/commit/63fcca725f7ed19b891b20ff7eaec3e660ff5dba))
* **client:** report accurate errors for 403, 429, network, and 5xx ([c581946](https://github.com/adsabs/scix-mcp/commit/c581946b95984cecb8bbf576c94b8ee9f9fb6bf1))
* **library:** point annotation tools at biblib's real notes route ([6e91636](https://github.com/adsabs/scix-mcp/commit/6e916360543b34d6463f9fc6133007b542cf7c44))
* **library:** point annotation tools at biblib's real notes route ([1b392d6](https://github.com/adsabs/scix-mcp/commit/1b392d6a2589d2596f2834f83bdb9784479ac956))
* **library:** post bibcode, not bibcodes, to biblib create ([65d62bc](https://github.com/adsabs/scix-mcp/commit/65d62bca467ee7e0738f1e379e96e5afb5918f54))
* **library:** post bibcode, not bibcodes, to biblib create ([50c0722](https://github.com/adsabs/scix-mcp/commit/50c07229c7fc0311bfd0e34b5a90e294c1791517))
