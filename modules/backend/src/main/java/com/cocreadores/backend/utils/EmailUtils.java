package com.cocreadores.backend.utils;

public class EmailUtils {
    private EmailUtils(){}

    public static String generatePasswordRecoveryEmail(String frontendUrl, String token){
        String tokenUrl = frontendUrl + "/reset-password/" + token;
        return String.format("""
                <!DOCTYPE html>
                <html>
                    <head>
                        <meta charset="utf-8">
                        <style>
                            html,
                            body {
                                margin: 0 auto !important;
                                padding: 0 !important;
                                height: 100%% !important;
                                width: 100%% !important;}
                            * {-ms-text-size-adjust: 100%%;}
                            table,
                            td {mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;}
                            img {-ms-interpolation-mode:bicubic;}
                            a {text-decoration: none;}
                            @media only screen and (max-width:400px) {\s
                                #BOTON {width:80%%;}
                            }
                        </style>
                    </head>
                    <body width="100%%" style="margin: 0; padding: 0 !important; mso-line-height-rule: exactly; text-align:center;">
                        <div style="background-color:#F752AA; width:100%%; padding:30px 0; text-align:center;">
                            <table width="640px" role="presentation" cellspacing="0" cellpadding="0" border="0" style="width:640px; min-width:640px; margin:0 auto; background:#ffffff; font-family:Calibri,sans-serif; text-align:center; line-height:1; border:2px solid #F752AA; border-radius:6px;">
                                <tr id="ESPACIADO"><td colspan="3" style="height:40px;"></td></tr>
                                <tr>
                                    <td bgcolor="" width="8%%"></td>
                                    <td bgcolor="" width="84%%">
                                        <p id="LOGO" style="padding:0; margin:0 auto; text-align:center;"><a href="https://crm.cocreadores.com/"><img style="display:block; max-width:100%%; margin:0 auto; height:100%%; text-align:center;" src="https://crm.cocreadores.com/logos/logo1.png" alt="CoCreadores" title="CoCreadores" border="0" width="296px" height="296px" /></a></p>
                                        <br>
                                        <br>
                                        <p style="color:#616565; font-size:18px; padding:0; margin:0 auto; text-align:left; line-height:1.3;">A través de este correo podrás realizar el proceso de restauración de contraseña. Tienes 30 minutos para restablecerla:</p>
                                        <br>
                                        <br>
                                        <table id="BOTON" style="margin:0 auto; width:50%%; min-width:50%%; text-align:center;" role="presentation" cellspacing="0" cellpadding="0" border="0">
                                            <tr>
                                                <td align="center" bgcolor="#F752AA" style="width:100%%; height:38px; border-radius:6px; font-size:18px; font-family:Calibri,sans-serif; padding:4px;">
                                                    <a href="%s" target="_blank" style="text-decoration:none; color:#ffffff; width:100%%"><b>Cambiar contraseña</b></a>
                                                </td>
                                            </tr>
                                        </table>
                                        <p style="color:#616565; font-size:13px; padding:5px 0 0 0; margin:0 auto; text-align:center; line-height:1.1;">%s</p>
                                        <br>
                                        <br>
                                        <p style="color:#616565; font-size:18px; padding:0; margin:0 auto; text-align:left; line-height:1.3;">Si no solicitaste el cambio de contraseña puedes desestimar este correo.</p>
                                        <br>
                                        <br>
                                    </td>
                                    <td bgcolor="" width="8%%"></td>
                                </tr>
                                <tr id="ESPACIADO"><td colspan="3" style="height:40px;"></td></tr>
                            </table>
                        </div>
                    </body>
                </html>
                """, tokenUrl, tokenUrl);
    }

    public static String generateWelcomeEmail(String frontendUrl, String email){
        return String.format("""
                <!DOCTYPE html>
                <html>
                    <head>
                        <meta charset="utf-8">
                        <style>
                            html,
                            body {
                                margin: 0 auto !important;
                           ing: 0 !important;
                                height: 100%% !important;
                                width: 100%% !important;}
                            * {-ms-text-size-adjust: 100%%;}
                            table,
                            td {mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;}
                            img {-ms-interpolation-mode:bicubic;}
                            a {text-decoration: none;}
                            @media only screen and (max-width:400px) {\s
                                #BOTON {width:80%%;}
                            }
                        </style>
                    </head>
                    <body width="100%%" style="margin: 0; padding: 0 !important; mso-line-height-rule: exactly; text-align:center;">
                        <div style="background-color:#252d65; width:100%%; padding:30px 0; text-align:center;">
                            <table width="640px" role="presentation" cellspacing="0" cellpadding="0" border="0" style="width:640px; min-width:640px; margin:0 auto; background:#ffffff; font-family:Calibri,sans-serif; text-align:center; line-height:1; border:2px solid #252d65; border-radius:6px;">
                                <tr id="ESPACIADO"><td colspan="3" style="height:40px;"></td></tr>
                                <tr>
                                    <td bgcolor="" width="10%%"></td>
                                    <td bgcolor="" width="80%%">
                                        <p id="LOGO" style="padding:0; margin:0 auto; text-align:center;"><a href="https://ia.aucatel.com"><img style="display:block; max-width:100%%; margin:0 auto; height:100%%; text-align:center;" src="https://ia.aucatel.com/assets/logo.png" alt="AUCATEL" title="Asistente IA AUCATEL" border="0" width="296px" height="296px" /></a></p>
                                        <br>
                                        <br>
                                        <p style="color:#616565; font-size:18px; padding:0; margin:0 auto; text-align:left; line-height:1.3;">Te damos la bienvenida a nuestro <b>Asistente IA</b>.</p>
                                        <br>
                                        <p style="color:#616565; font-size:18px; padding:0; margin:0 auto; text-align:left; line-height:1.3;">Ya puedes analizar tus proyectos con la ayuda de la inteligencia artificial.</p>
                                        <br>
                                        <br>
                                        <hr style="width:100%%; height:2px; background:#227ec2; color:#227ec2; box-shadow:none; border:none; margin:0; padding:0;">
                                        <br>
                                        <br>
                                        <p style="color:#616565; font-size:18px; padding:0; margin:0 auto; text-align:left; line-height:1.3;"><b>Información de tu cuenta</b></p>
                                        <p style="color:#616565; font-size:18px; padding:0; margin:0 auto; text-align:left; line-height:1.3;">Correo electrónico asociado a tu cuenta: %s</p>
                                        <p style="color:#616565; font-size:18px; padding:0; margin:0 auto; text-align:left; line-height:1.3;">¿Olvidaste tu contraseña? <a style="color:#227ec2; text-decoration:underline;" href="%s/recover-password" title="Restablecer contraseña">Restablecer aquí.</a></p>
                                        <br>
                                        <br>
                                    </td>
                                    <td bgcolor="" width="10%%"></td>
                                </tr>
                                <tr id="ESPACIADO"><td colspan="3" style="height:40px;"></td></tr>
                            </table>
                        </div>
                    </body>
                </html>
                """, email, frontendUrl);
    }
}
