export const SHARED_STYLES = {
    container:
      'max-width: 600px; margin: 20px auto; background: hsl(224, 71.4%, 4.1%); border: 1px solid hsl(215, 27.9%, 16.9%); border-radius: 12px; overflow: hidden; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);',
    header:
      'padding: 30px; text-align: center; background: hsl(224, 71.4%, 4.1%);',
    logo: 'width: 120px; height: auto; margin: 0 auto 20px;',
    title:
      'font-size: 28px; margin: 20px 0; color: hsl(210, 20%, 98%); font-weight: bold;',
    content: 'padding: 30px; background: hsl(224, 71.4%, 4.1%);',
    text: 'font-size: 16px; line-height: 1.6; margin-bottom: 20px; color: hsl(210, 20%, 98%);',
    button:
      'background-color: hsl(32, 77%, 50%); color: hsl(32, 77%, 98%); padding: 14px 28px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; margin: 20px 0; transition: background-color 0.3s;',
    note: 'font-size: 14px; line-height: 1.4; color: hsl(217.9, 10.6%, 64.9%); border-top: 1px solid hsl(215, 27.9%, 16.9%); padding-top: 20px; margin-top: 30px;',
  };
  
  export const FOOTER_HTML = `
  <div style="background: hsl(224, 71.4%, 4.1%); font-size: 12px; text-align: center; color: hsl(217.9, 10.6%, 64.9%); padding: 20px; border-top: 1px solid hsl(215, 27.9%, 16.9%);">
    <p style="margin: 0;">© ${new Date().getFullYear()} BetMasters. Todos los derechos reservados.</p>
  </div>`;