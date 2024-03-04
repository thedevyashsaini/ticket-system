import {NextRequest, NextResponse} from "next/server";
import {type CookieOptions, createServerClient} from "@supabase/ssr";
import {Database} from "../../../../database.types";
import {shouldUseURLPlugin} from "next/dist/build/webpack/loaders/css-loader/src/utils";

export async function GET(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })


  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SERVICE_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  const searchParams = request.nextUrl.searchParams
  const id = searchParams.get('id')

  const {data: admin} = await supabase.from("Admins").select("*")
  if (!admin || admin.length < 1) {
    return NextResponse.json({error: "No Access"}, {status: 403})
  }

  console.log(id)

  if (!id) {
    return NextResponse.json({error: "No ID provided"}, {status: 400})

  }

  let resp = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/Guests?id=eq.${id}&select=scanned`, {
    headers: {
      "apikey": process.env.SERVICE_KEY!,
      "Authorization": `Bearer ${process.env.SERVICE_KEY!}`,
    }
  })
  let data = await resp.json()
  return NextResponse.json(data, {status: 200})
}