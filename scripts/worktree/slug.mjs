#!/usr/bin/env node

import { branchToSlug, getBranchName } from './lib.mjs';

const branch = process.argv[2] ?? getBranchName();
console.log(branchToSlug(branch));
