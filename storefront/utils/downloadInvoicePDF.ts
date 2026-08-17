// @ts-ignore
import html2pdf from 'html2pdf.js';

function numberToWordsINR(amount: number): string {
  const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  let num = Math.floor(amount);
  if (num === 0) return 'Zero Rupees Only';

  function convert(n: number): string {
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + a[n % 10] : ' ');
    if (n < 1000) return a[Math.floor(n / 100)] + 'Hundred ' + (n % 100 !== 0 ? convert(n % 100) : '');
    if (n < 100000) return convert(Math.floor(n / 1000)) + 'Thousand ' + (n % 1000 !== 0 ? convert(n % 1000) : '');
    if (n < 10000000) return convert(Math.floor(n / 100000)) + 'Lakh ' + (n % 100000 !== 0 ? convert(n % 100000) : '');
    return convert(Math.floor(n / 10000000)) + 'Crore ' + (n % 10000000 !== 0 ? convert(n % 10000000) : '');
  }

  return convert(num).trim() + ' Rupees Only';
}

export async function downloadDirectTaxInvoicePDF(order: any) {
  if (!order) return;

  const totalAmount = order.total_amount || 0;
  const taxableBase = (totalAmount / 1.18).toFixed(2);
  const totalGst = (totalAmount - parseFloat(taxableBase)).toFixed(2);
  const cgst = (parseFloat(totalGst) / 2).toFixed(2);
  const sgst = (parseFloat(totalGst) / 2).toFixed(2);
  const amountInWords = numberToWordsINR(totalAmount);
  const invoiceDate = new Date(order.created_at || Date.now()).toLocaleDateString('en-IN');

  const itemsRows = (order.items || []).map((it: any, idx: number) => `
    <tr>
      <td style="text-align: center; font-weight: bold; padding: 6px; border: 1px solid #cbd5e1;">${idx + 1}</td>
      <td style="font-weight: bold; padding: 6px; border: 1px solid #cbd5e1; color: #0f172a;">
        ${it.title} ${it.size ? `(Size: ${it.size})` : ''}
      </td>
      <td style="text-align: center; padding: 6px; border: 1px solid #cbd5e1; color: #475569;">61091000</td>
      <td style="text-align: center; font-weight: bold; padding: 6px; border: 1px solid #cbd5e1;">${it.quantity}</td>
      <td style="text-align: center; font-weight: bold; padding: 6px; border: 1px solid #cbd5e1; color: #2563eb;">
        ${it.warranty || '6 Months Brand Warranty'}
      </td>
      <td style="text-align: right; padding: 6px; border: 1px solid #cbd5e1;">₹${(it.price / 1.18).toFixed(2)}</td>
      <td style="text-align: center; padding: 6px; border: 1px solid #cbd5e1; color: #475569;">18%</td>
      <td style="text-align: right; font-weight: bold; padding: 6px; border: 1px solid #cbd5e1; color: #0f172a;">
        ₹${(it.price * it.quantity).toFixed(2)}
      </td>
    </tr>
  `).join('');

  const htmlContainer = document.createElement('div');
  htmlContainer.style.position = 'absolute';
  htmlContainer.style.left = '-9999px';
  htmlContainer.style.top = '-9999px';
  htmlContainer.style.width = '794px';
  htmlContainer.style.background = '#ffffff';
  htmlContainer.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

  htmlContainer.innerHTML = `
    <div style="padding: 20px; border: 1px solid #cbd5e1; border-radius: 8px; color: #0f172a; font-size: 11px; line-height: 1.4;">
      
      <!-- Header Bar (No QR Code) -->
      <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #0f172a; padding-bottom: 10px; margin-bottom: 12px;">
        <div>
          <div style="font-size: 22px; font-weight: 900; font-family: monospace; letter-spacing: -0.5px; color: #0f172a;">SHADOW ARROW</div>
          <div style="font-size: 9px; font-weight: 700; color: #475569; text-transform: uppercase; font-family: monospace;">OFFICIAL GST TAX INVOICE / BILL OF SUPPLY</div>
          <div style="font-size: 9px; color: #64748b; margin-top: 2px; font-family: monospace;">Original for Recipient</div>
        </div>
        <div style="text-align: right; font-family: monospace; font-size: 10px;">
          <div style="font-weight: bold; color: #0f172a;">REGISTERED SELLER GSTIN</div>
          <div style="font-weight: bold; color: #1d4ed8; font-size: 12px;">19BVKPL6301H1ZH</div>
          <div style="color: #64748b; font-size: 9px;">support.shadowarrow@gmail.com</div>
        </div>
      </div>

      <!-- Sold By vs Order Metadata Grid -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 12px; font-family: monospace;">
        <div style="background: #f8fafc; padding: 10px; border: 1px solid #e2e8f0; border-radius: 6px;">
          <div style="font-size: 8px; font-weight: 700; color: #94a3b8; text-transform: uppercase;">Sold By (Registered Seller)</div>
          <div style="font-weight: bold; font-size: 11px; margin-top: 2px;">SHADOW ARROW (Bijoy Lohar)</div>
          <div style="font-size: 9.5px; color: #475569; margin-top: 2px; line-height: 1.3;">
            C/O BINOD LOHAR, DAPANJURI ROAD, BHARA, Dapanjuri, District: Bankura, West Bengal - 722157
          </div>
          <div style="font-size: 9.5px; color: #475569; margin-top: 2px;">State Code: 19 (West Bengal)</div>
        </div>

        <div style="background: #f8fafc; padding: 10px; border: 1px solid #e2e8f0; border-radius: 6px; text-align: right; line-height: 1.5;">
          <div>Invoice No: <strong style="color: #0f172a;">INV-SA-${order.order_id}</strong></div>
          <div>Invoice Date: <strong>${invoiceDate}</strong></div>
          <div>Order ID: <strong style="color: #1d4ed8;">#${order.order_id}</strong></div>
          <div>Payment Mode: <strong style="text-transform: uppercase;">${order.payment_method === 'COD' ? 'CASH ON DELIVERY (COD)' : 'PREPAID (ONLINE)'}</strong></div>
          ${order.razorpay_payment_id ? `<div>Txn ID: <strong>${order.razorpay_payment_id}</strong></div>` : ''}
        </div>
      </div>

      <!-- Billing & Shipping Address Grid -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 12px; font-family: monospace;">
        <div style="background: #f8fafc; padding: 10px; border: 1px solid #e2e8f0; border-radius: 6px;">
          <div style="font-size: 8px; font-weight: 700; color: #94a3b8; text-transform: uppercase;">Billing Address (Bill To)</div>
          <div style="font-weight: bold; font-size: 11px; margin-top: 2px;">${order.customer_name}</div>
          <div>Mob: ${order.customer_phone}</div>
          <div>${order.customer_email || ''}</div>
          <div style="margin-top: 2px; line-height: 1.3;">${order.shipping_address}</div>
        </div>

        <div style="background: #f8fafc; padding: 10px; border: 1px solid #e2e8f0; border-radius: 6px;">
          <div style="font-size: 8px; font-weight: 700; color: #94a3b8; text-transform: uppercase;">Shipping Address (Ship To)</div>
          <div style="font-weight: bold; font-size: 11px; margin-top: 2px;">${order.customer_name}</div>
          <div>Mob: ${order.customer_phone}</div>
          <div>${order.customer_email || ''}</div>
          <div style="margin-top: 2px; line-height: 1.3;">${order.shipping_address}</div>
        </div>
      </div>

      <!-- Line Item Table with Warranty Column -->
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 12px; font-family: monospace; font-size: 10px;">
        <thead>
          <tr style="background: #f1f5f9; text-transform: uppercase; font-weight: bold;">
            <th style="padding: 6px; border: 1px solid #cbd5e1; width: 25px; text-align: center;">#</th>
            <th style="padding: 6px; border: 1px solid #cbd5e1; text-align: left;">Product Description</th>
            <th style="padding: 6px; border: 1px solid #cbd5e1; width: 65px; text-align: center;">HSN</th>
            <th style="padding: 6px; border: 1px solid #cbd5e1; width: 35px; text-align: center;">Qty</th>
            <th style="padding: 6px; border: 1px solid #cbd5e1; width: 140px; text-align: center;">Warranty Period</th>
            <th style="padding: 6px; border: 1px solid #cbd5e1; width: 80px; text-align: right;">Taxable Rate</th>
            <th style="padding: 6px; border: 1px solid #cbd5e1; width: 45px; text-align: center;">GST</th>
            <th style="padding: 6px; border: 1px solid #cbd5e1; width: 90px; text-align: right;">Total Amount</th>
          </tr>
        </thead>
        <tbody>
          ${itemsRows}
        </tbody>
      </table>

      <!-- Totals & Tax Breakdown -->
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; font-family: monospace;">
        <div style="max-width: 320px;">
          <div style="font-weight: bold; color: #047857; font-size: 10px; margin-bottom: 2px;">
            ✓ GST VERIFIED OFFICIAL TAX INVOICE
          </div>
          <div style="font-size: 9px; color: #64748b; line-height: 1.3;">
            Supply calculated under 18% Total GST (9% CGST + 9% SGST). Official merchant tax receipt.
          </div>
          <div style="font-size: 9.5px; font-weight: bold; margin-top: 6px;">
            Amount in Words: <span style="font-style: italic;">${amountInWords}</span>
          </div>
        </div>

        <div style="width: 220px; background: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; border-radius: 6px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 3px; color: #475569;">
            <span>Taxable Base Value:</span><span>₹${taxableBase}</span>
          </div>
          <div style="display: flex; justify-between; margin-bottom: 3px; color: #475569;">
            <span>CGST (9%):</span><span>₹${cgst}</span>
          </div>
          <div style="display: flex; justify-between; margin-bottom: 3px; color: #475569;">
            <span>SGST (9%):</span><span>₹${sgst}</span>
          </div>
          <div style="display: flex; justify-between; font-size: 12px; font-weight: 900; color: #0f172a; border-top: 1px solid #cbd5e1; padding-top: 4px; margin-top: 4px;">
            <span>GRAND TOTAL:</span><span style="color: #1d4ed8;">₹${totalAmount.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <!-- Footer Terms & Disclaimer -->
      <div style="border-top: 1px solid #e2e8f0; padding-top: 8px; display: flex; justify-content: space-between; font-size: 8.5px; color: #64748b; font-family: monospace;">
        <div>
          <div style="font-weight: bold; color: #334155;">Returns & Warranty Policy Note:</div>
          <div>7-Day Easy Return Policy across India. Brand warranty claims require this invoice.</div>
        </div>
        <div style="text-align: right;">
          <div style="font-weight: bold; color: #0f172a;">For SHADOW ARROW</div>
          <div style="font-style: italic;">Computer Generated Tax Invoice</div>
          <div style="font-weight: bold;">NO SIGNATURE REQUIRED</div>
        </div>
      </div>

    </div>
  `;

  document.body.appendChild(htmlContainer);

  try {
    // Dynamic import to avoid SSR issues
    // @ts-ignore
    const html2pdfModule = (await import('html2pdf.js')).default;
    const opt: any = {
      margin: 6,
      filename: `SHADOW_ARROW_TAX_INVOICE_${order.order_id}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        logging: false,
        scrollX: 0,
        scrollY: 0,
        windowWidth: 800,
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
    };

    await html2pdfModule().set(opt).from(htmlContainer).save();
  } catch (err) {
    console.error('Direct PDF download error:', err);
  } finally {
    document.body.removeChild(htmlContainer);
  }
}
