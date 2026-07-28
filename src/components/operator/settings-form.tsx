'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { ArchitectureInput, Note, Website } from '@/lib/supabase/types';

export function SettingsForm({
  projectId,
  website,
  architectureInput,
  notes,
}: {
  projectId: string;
  website: Website | null;
  architectureInput: ArchitectureInput | null;
  notes: Note[];
}) {
  const router = useRouter();
  const [websiteUrl, setWebsiteUrl] = useState(website?.url ?? '');
  const [businessType, setBusinessType] = useState(architectureInput?.business_type ?? '');
  const [siteType, setSiteType] = useState(architectureInput?.site_type ?? '');
  const [primaryOffer, setPrimaryOffer] = useState(architectureInput?.primary_offer ?? '');
  const [secondaryOffers, setSecondaryOffers] = useState(architectureInput?.secondary_offers ?? '');
  const [primaryIcp, setPrimaryIcp] = useState(architectureInput?.primary_icp ?? '');
  const [secondaryIcps, setSecondaryIcps] = useState(architectureInput?.secondary_icps ?? '');
  const [conversionGoal, setConversionGoal] = useState(architectureInput?.conversion_goal ?? '');
  const [trustProofAssets, setTrustProofAssets] = useState(architectureInput?.trust_proof_assets ?? '');
  const [nextgridNotes, setNextgridNotes] = useState(architectureInput?.nextgrid_notes ?? '');
  const [pricingContext, setPricingContext] = useState(architectureInput?.pricing_context ?? '');
  const [engagementInterest, setEngagementInterest] = useState(
    architectureInput?.engagement_interest ?? ''
  );
  const [icpNotes, setIcpNotes] = useState(architectureInput?.icp_notes ?? '');
  const [productNotes, setProductNotes] = useState(architectureInput?.product_notes ?? '');
  const [offerNotes, setOfferNotes] = useState(architectureInput?.offer_notes ?? '');
  const [proofNotes, setProofNotes] = useState(architectureInput?.proof_notes ?? '');
  const [noteBody, setNoteBody] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  async function saveWebsite() {
    const response = await fetch(`/api/projects/${projectId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ websiteUrl }),
    });
    setMessage(response.ok ? 'Website updated.' : 'Failed to update website.');
    router.refresh();
  }

  async function saveArchitecture() {
    const response = await fetch(`/api/projects/${projectId}/architecture-inputs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        business_type: businessType,
        site_type: siteType,
        primary_offer: primaryOffer,
        secondary_offers: secondaryOffers,
        primary_icp: primaryIcp,
        secondary_icps: secondaryIcps,
        conversion_goal: conversionGoal,
        trust_proof_assets: trustProofAssets,
        icp_notes: icpNotes,
        product_notes: productNotes,
        offer_notes: offerNotes,
        proof_notes: proofNotes,
        nextgrid_notes: nextgridNotes,
        pricing_context: pricingContext,
        engagement_interest: engagementInterest,
      }),
    });
    setMessage(response.ok ? 'Architecture inputs saved.' : 'Failed to save architecture inputs.');
    router.refresh();
  }

  async function saveNote() {
    const response = await fetch(`/api/projects/${projectId}/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body: noteBody }),
    });
    setMessage(response.ok ? 'Note added.' : 'Failed to add note.');
    setNoteBody('');
    router.refresh();
  }

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <Card className="shadow-none">
        <CardHeader>
          <CardTitle>Website</CardTitle>
          <CardDescription>Primary URL used for crawl and report context.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-2">
          <Label htmlFor="websiteUrl">Website URL</Label>
          <Input id="websiteUrl" value={websiteUrl} onChange={(event) => setWebsiteUrl(event.target.value)} />
        </CardContent>
        <CardFooter>
          <Button onClick={saveWebsite}>Save website</Button>
        </CardFooter>
      </Card>

      <Card className="shadow-none xl:row-span-2">
        <CardHeader>
          <CardTitle>Project intake</CardTitle>
          <CardDescription>
            Structured brief for AEO analysis, plus freeform operator notes.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="businessType">Business type</Label>
              <Input
                id="businessType"
                value={businessType}
                onChange={(event) => setBusinessType(event.target.value)}
                placeholder="e.g. B2B SaaS, agency, ecommerce"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="siteType">Site type</Label>
              <Input
                id="siteType"
                value={siteType}
                onChange={(event) => setSiteType(event.target.value)}
                placeholder="e.g. marketing site, docs + product"
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="primaryOffer">Primary offer</Label>
            <Input
              id="primaryOffer"
              value={primaryOffer}
              onChange={(event) => setPrimaryOffer(event.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="secondaryOffers">Secondary offers</Label>
            <Textarea
              id="secondaryOffers"
              value={secondaryOffers}
              onChange={(event) => setSecondaryOffers(event.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="primaryIcp">Primary ICP</Label>
            <Input
              id="primaryIcp"
              value={primaryIcp}
              onChange={(event) => setPrimaryIcp(event.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="secondaryIcps">Secondary ICPs</Label>
            <Textarea
              id="secondaryIcps"
              value={secondaryIcps}
              onChange={(event) => setSecondaryIcps(event.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="conversionGoal">Conversion goal</Label>
            <Input
              id="conversionGoal"
              value={conversionGoal}
              onChange={(event) => setConversionGoal(event.target.value)}
              placeholder="e.g. book demo, start trial"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="trustProof">Trust / proof assets</Label>
            <Textarea
              id="trustProof"
              value={trustProofAssets}
              onChange={(event) => setTrustProofAssets(event.target.value)}
              placeholder="Logos, case studies, certifications, metrics"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="engagementInterest">Engagement interest</Label>
            <Input
              id="engagementInterest"
              value={engagementInterest}
              onChange={(event) => setEngagementInterest(event.target.value)}
              placeholder="e.g. Site audit, Full audit, sprint, retainer"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="pricingContext">Pricing / engagement context</Label>
            <Textarea
              id="pricingContext"
              value={pricingContext}
              onChange={(event) => setPricingContext(event.target.value)}
              placeholder="Budget band, package interest, commercial notes"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="nextgridNotes">Operator notes</Label>
            <Textarea
              id="nextgridNotes"
              value={nextgridNotes}
              onChange={(event) => setNextgridNotes(event.target.value)}
              placeholder="Internal operator context for recommendations"
            />
          </div>
          <div className="border-t border-border pt-4">
            <p className="mb-3 text-sm font-medium">Operator notes (freeform)</p>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="icp">ICP notes</Label>
                <Textarea id="icp" value={icpNotes} onChange={(event) => setIcpNotes(event.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="product">Product notes</Label>
                <Textarea
                  id="product"
                  value={productNotes}
                  onChange={(event) => setProductNotes(event.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="offer">Offer notes</Label>
                <Textarea id="offer" value={offerNotes} onChange={(event) => setOfferNotes(event.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="proof">Customer proof notes</Label>
                <Textarea id="proof" value={proofNotes} onChange={(event) => setProofNotes(event.target.value)} />
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={saveArchitecture}>Save architecture inputs</Button>
        </CardFooter>
      </Card>

      <Card className="shadow-none">
        <CardHeader>
          <CardTitle>Operator notes</CardTitle>
          <CardDescription>Internal notes for this project.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Textarea
            value={noteBody}
            onChange={(event) => setNoteBody(event.target.value)}
            placeholder="Add internal note for this project"
          />
          <div className="grid gap-2">
            {notes.map((note) => (
              <div key={note.id} className="rounded-lg border border-border p-3 text-sm">
                <p>{note.body}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {new Date(note.created_at).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter className="flex-col items-start gap-2">
          <Button onClick={saveNote} disabled={!noteBody.trim()}>
            Add note
          </Button>
          {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
        </CardFooter>
      </Card>
    </div>
  );
}
