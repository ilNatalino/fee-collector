# Fee Collector

This context tracks shared collections of money inside a group and the payments members make toward what they owe.

## Language

**Group**:
A collection that Members join through Memberships to raise money toward a shared target amount.
_Avoid_: project, pool

**Group Target**:
The total amount a group intends to collect from its members.
_Avoid_: total amount, progress denominator

**Group Category**:
An optional classification of a Group such as food, travel, home, or utilities.
_Avoid_: energy

**Group Status**:
The current state of a group as collecting or completed.
_Avoid_: active, progress state

**Group Progress**:
The percentage of the Group Target already covered by collected Payments.
_Avoid_: paid member ratio, activity state

**Collected Amount**:
The current sum of recorded Payments applied toward a Group Target or a Quota, evaluated at cent precision.
_Avoid_: paid flag, progress percentage

**Remaining Amount**:
The portion of a Group Target or a Quota that is still uncovered by current recorded Payments, evaluated at cent precision.
_Avoid_: unpaid status, target amount

**Due State**:
The current timing state of a Group as not-applicable, no-deadline, upcoming, or overdue, evaluated by calendar day in local time.
_Avoid_: group status, reminder state

**Quota Breakdown**:
The count of Memberships in a Group grouped by Quota Status as unpaid, partial, and paid.
_Avoid_: active members, paid summary

**Member**:
A human being who may appear in one or more Groups through separate Memberships.
_Avoid_: user, person

**Membership**:
A group-local record connecting one Member to one Group.
_Avoid_: participant, member entry

**Quota**:
The amount a Membership owes to a Group, expressed at cent precision and strictly positive.
_Avoid_: payment, contribution event

**Payment**:
An amount of money added toward a Membership's Quota, expressed at cent precision, strictly positive, and capped by the remaining quota.
_Avoid_: quota, obligation

**Quota Status**:
The current state of a Membership's Quota as unpaid, partial, or paid.
_Avoid_: paid flag, payment state

**Activity Log**:
A chronological view of the currently recorded Payments across one or more Groups, preserving the recorded Member and Group names for each listed Payment.
_Avoid_: quota list, member list

**Membership Activity Log**:
A chronological view of the currently recorded Payments for one Membership inside one Group, preserving the recorded Member and Group names for each listed Payment.
_Avoid_: member profile, user history

## Relationships

- A **Group** has one or more **Memberships**
- A **Group** has one **Group Target**
- A **Group** may have one **Group Category**
- A **Group** has one current **Group Status**
- A **Group** has one current **Group Progress**
- A **Group** has one current **Collected Amount** and one current **Remaining Amount**
- A **Group** has one current **Due State**
- A **Group** has one current **Quota Breakdown**
- A **Member** may appear in zero or more **Groups** through separate **Memberships**
- A **Membership** belongs to exactly one **Group**
- A **Membership** refers to exactly one **Member**
- A **Membership** has one **Quota** in its **Group**
- A **Membership** may make zero or more **Payments** toward its **Quota**
- A **Payment** belongs to exactly one **Membership**
- A **Membership**'s current paid amount is the sum of its current recorded **Payments**
- A **Group** has at most one **Membership** per **Member**
- A **Group Target** equals the sum of the **Quotas** in that **Group**
- A **Group Target** is fixed for the life of the **Group**, and the **Quotas** in that **Group** must be reallocated so their sum stays equal to it
- **Quota** reallocation is only valid before any **Payment** exists in the **Group**
- The **Membership** roster is locked once the first **Payment** exists in the **Group**
- Initial **Quotas** must sum exactly to the **Group Target** when a **Group** is created
- A **Quota** has one current **Quota Status**
- A **Group Status** is determined from whether current **Payments** cover the **Group Target**
- A **Quota Status** is determined from the current **Payments** against a **Quota**
- A **Group Progress** and **Quota Breakdown** are determined from the current **Payments** in the **Group**
- An **Activity Log** lists the current state of recorded **Payments** in chronological order
- A **Membership Activity Log** lists the current state of recorded **Payments** for one **Membership** in chronological order

## Example dialogue

> **Dev:** "If Marco joins the dinner **Group** and sends 10 euros now, did his **Membership** change?"
> **Domain expert:** "The **Membership** is the same. Its **Quota** is still 25 euros, and the **Payment** is 10 euros against that **Quota**."

## Flagged ambiguities

- "quota" and "payment" were being used interchangeably; resolved: **Quota** is the obligation, **Payment** is an event against that obligation.
- Overpayment was considered; resolved: a **Payment** cannot exceed the remaining **Quota**.
- The **Group Target** and the sum of member **Quotas** were treated as separate values in code; resolved: they are the same concept in this context.
- "active" was being used loosely in code; resolved: the canonical term is **Group Status**, with values collecting or completed.
- "progress" was ambiguous between money and member counts; resolved: **Group Progress** means collected **Payments** as a percentage of the **Group Target**.
- Partial **Quota Status** was implicit in some screens but absent from group summaries; resolved: **Quota Breakdown** counts unpaid, partial, and paid **Memberships** distinctly.
- Deadline timing was mixed into display only; resolved: timing is a separate **Due State**, not part of **Group Status**.
- Deadline timing precision was unclear; resolved: **Due State** is evaluated by calendar day in local time, not by exact timestamp.
- A completed **Group** created a timing contradiction; resolved: **Due State** is only meaningful while **Group Status** is collecting, and uses not-applicable once a **Group** is completed.
- Zero **Quotas** were considered; resolved: every **Quota** must be strictly positive.
- "member" was being used to mean both a person and a group-local record; resolved: **Member** is the global human concept and **Membership** is the group-local record.
- The cross-group human concept had been called **Person** and "user"; resolved: the canonical term is **Member**.
- The link between **Membership** and **Member** was unclear in code; resolved: every **Membership** refers to exactly one **Member**.
- Creating a **Group** could either select existing members or create them inline; resolved: inline **Member** creation is valid as part of **Group** creation, but a **Member** is still created before the **Membership**.
- Inline **Member** creation raised a deduplication question; resolved: **Member** deduplication uses exact full-name match until richer identity data exists.
- Duplicate participation in one **Group** was considered; resolved: a **Group** has at most one **Membership** per **Member**.
- **Membership** identity and **Member** identity were drifting together; resolved: a **Membership** resolves the current name from its **Member** rather than owning a separate identity snapshot.
- The **Activity Log** could have used live names or historical labels; resolved: it snapshots the recorded **Member** and **Group** names at payment time.
- Payment mutability and history were in tension; resolved: **Payments** can be edited and deleted in place, and the **Activity Log** shows only the current state of listed **Payments**, not an audit trail.
- Payment editing semantics were unclear across modules; resolved: editing or deleting a **Payment** changes the live **Quota Status**, **Group Progress**, and **Quota Breakdown**.
- The source of truth for paid amount was split between membership state and payments; resolved: a **Membership**'s current paid amount is derived from its current recorded **Payments**.
- "mark paid" existed alongside **Payment** creation; resolved: it is only UI shorthand for creating one **Payment** equal to the remaining **Quota**.
- The **Group Projection** could have omitted money totals; resolved: it exposes current **Collected Amount** and **Remaining Amount** directly.
- Editing a **Payment** could have changed chronology; resolved: a **Payment** keeps its original recorded date when edited.
- Payment status existed in code without a real workflow; resolved: every **Payment** is confirmed at creation, so pending status is not part of the domain language.
- Payment editing scope was unclear; resolved: editing a **Payment** keeps it on the same **Membership** and may correct only fields on that **Payment**.
- Payment coverage was unclear; resolved: each **Payment** belongs to exactly one **Membership**.
- "member activity" was ambiguous between cross-group member history and group-local membership history; resolved: the canonical term is **Membership Activity Log**, scoped to one **Membership** in one **Group**.
- Completion semantics were unclear under mutable current-state **Payments**; resolved: a **Group** reopens from completed to collecting if current **Payments** no longer cover the **Group Target**.
- **Payment** amount validity was unclear; resolved: every **Payment** amount is strictly positive.
- Editing a **Payment** could have broken the **Quota** cap; resolved: after any edit, the current **Payments** for a **Membership** must still not exceed its **Quota**.
- Recorded names on a **Payment** could have been mutable in code; resolved: a **Payment** keeps its recorded **Member** and **Group** names as immutable snapshots.
- Empty **Groups** were discussed and rejected for this project; resolved: a **Group** must have at least one **Membership**.
- The relationship between **Group Target** and changing **Memberships** was unclear; resolved: the **Group Target** is fixed for the life of the **Group**, and **Quotas** must be reallocated to keep their sum equal to it.
- Reallocation timing was unclear once collection started; resolved: **Quotas** may be reallocated only before any **Payment** exists.
- Post-payment roster changes were considered; resolved: the **Membership** roster is locked once the first **Payment** exists.
- Creation-time allocation was unclear; resolved: initial **Quotas** must sum exactly to the fixed **Group Target**.
- Money precision was unclear while the code used floating-point parsing; resolved: **Group Target**, **Quota**, **Payment**, **Collected Amount**, and **Remaining Amount** use cent precision.
- **Group Category** was treated inconsistently in code; resolved: it is optional.
- The canonical optional **Group Category** term was inconsistent in code; resolved: the category value is utilities, not energy.
- Emoji was considered as a possible group concept; resolved: it is UI decoration, not part of the domain language.