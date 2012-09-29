OpenErp Console:
--------------------

This is a module to be able to use the normal orm syntaxis from a console with to test the code without have to
restart the server

THIS IS BETA SOFTWARE

How to install?
---------------------------

1. Install [Cython] 
2. Install the [rfoo](http://code.google.com/p/rfoo/) note:dont use pip
   for this
3. Clone the repository on your openerp addons folder
3. Update you addons list in your openerp
4. Install the module in your project

How to use?
--------------------
This is still beta is the first version so this will change pretty soon.

1. Access to the project.
2. Launch rconsole
3. In the console there's 3 functions (\_self(), \_uid(), \_cr()) which each correspond to self, cr, uid in the normal openerp functions

Console
--------------------
Its posible to use the console in rfoo which is rconsole or the one im
starting to modify and is included in the code openerp-console.py


User impersonation
--------------------

To be able to make a query testing rights for user u just need to do
something like:

<pre><code>
    _uid(username)
</code></pre>


By default use the admin user



example of code:
<pre><code>
partners = _self().pool.get('res.partner')
partner = partners.browse(_cr(), _uid(), [1,2,3])
for part in partner
  partner.name
</code></pre>


TODO
--------------------

1. Access with no need to be a module
2. Add diferents ports in diferents projects. (right now just 1 port
   working)

