
# ACA Git Workflow 

<https://guides.github.com/introduction/flow/>

## Branch Naming Convention:

Here’s the branch naming convention that we should enforce for the devs.

### Feature Branch

Feature requests should have a naming convention of (where XXX is the Shortcut ticket number). For example:
feature-XXX-<feature-description> eg.
feature-1234-add-logout-button

### Bug fix branch

Bugs are similar with the “bug-” prefix.

_bug-XXX-<bug-description>_

eg.

_bug-1235-fix-crash-on-logout_

### Hotfix branches

In the event we have hotfixes (haha!), they can also have its own branch of the following form, where VVV is the hotfix version number:

_hotfix-VVV_

eg.

_hotfix-1.0.1_

## Commit Messages Convention

Add ticket number and concise message. Why?

## Version Tags

We’ll be using tags in the main branch to specify releases.

# Pre-commit & PR Merge Checks

## Merging to ‘main’:

As mentioned above, there’s only one rule: anything in the `main` branch is always deployable.

Before a branch is merged back to main the following this must have happened with the branch code:

**Commits:** Code changes, atomic and often.  
**Pull Request:** Which is followed by a …  
**Code Review:** The code is reviewed.  
**Tests:** The is deployed to a test server and tested.  
**Merge to main:** Finally, the tested code is merged into the main branch.  
